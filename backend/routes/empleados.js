const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/empleados.json');
const ACCOUNTS_FILE = path.join(__dirname, '../data/cuentas.json');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'tu-correo@gmail.com',
    pass: process.env.EMAIL_PASS || 'tu-password-app'
  }
});

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readAccounts() {
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeAccounts(data) {
  fs.mkdirSync(path.dirname(ACCOUNTS_FILE), { recursive: true });
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generatePassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function createResetToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function sendResetEmail(email, token) {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER || 'tu-correo@gmail.com',
    to: email,
    subject: 'Restablece tu contraseña',
    html: `<p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  });
}

// GET /api/empleados
router.get('/', (req, res) => {
  const empleados = readData();
  res.json(empleados);
});

// GET /api/empleados/:id
router.get('/:id', (req, res) => {
  const empleados = readData();
  const empleado = empleados.find((emp) => emp.id === req.params.id);

  if (!empleado) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  res.json(empleado);
});

// POST /api/empleados
router.post('/', async (req, res) => {
  const { nombre, apellido, email, tel, rol } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
  }

  const empleados = readData();
  const password = generatePassword();
  const nuevoEmpleado = {
    id: Date.now().toString(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: email ? email.trim() : '',
    tel: tel ? tel.trim() : '',
    rol: rol ? rol.trim() : ''
  };

  empleados.push(nuevoEmpleado);
  writeData(empleados);

  const cuentas = readAccounts();
  cuentas.push({
    id: nuevoEmpleado.id,
    email: nuevoEmpleado.email,
    password,
    rol: nuevoEmpleado.rol,
    resetToken: null,
    resetTokenExpires: null
  });
  writeAccounts(cuentas);

  try {
    if (nuevoEmpleado.email) {
      await sendResetEmail(nuevoEmpleado.email, createResetToken());
    }
  } catch (error) {
    console.error('No se pudo enviar el correo:', error.message);
  }

  res.status(201).json({ ...nuevoEmpleado, password });
});

// PUT /api/empleados/:id
router.put('/:id', (req, res) => {
  const empleados = readData();
  const index = empleados.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  const { nombre, apellido, email, tel, rol } = req.body;

  empleados[index] = {
    ...empleados[index],
    nombre: nombre !== undefined ? nombre.trim() : empleados[index].nombre,
    apellido: apellido !== undefined ? apellido.trim() : empleados[index].apellido,
    email: email !== undefined ? email.trim() : empleados[index].email,
    tel: tel !== undefined ? tel.trim() : empleados[index].tel,
    rol: rol !== undefined ? rol.trim() : empleados[index].rol,
  };

  writeData(empleados);
  res.json(empleados[index]);
});

// DELETE /api/empleados/:id
router.delete('/:id', (req, res) => {
  const empleados = readData();
  const filtered = empleados.filter((item) => item.id !== req.params.id);

  if (filtered.length === empleados.length) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  writeData(filtered);

  const cuentas = readAccounts().filter((item) => item.id !== req.params.id);
  writeAccounts(cuentas);

  res.status(204).end();
});

// POST /api/empleados/reset-password
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  const cuentas = readAccounts();
  const cuenta = cuentas.find((item) => item.email === email);
  if (!cuenta) {
    return res.status(404).json({ error: 'No existe una cuenta con ese email' });
  }

  const token = createResetToken();
  const expiresAt = Date.now() + 1000 * 60 * 30;
  cuenta.resetToken = token;
  cuenta.resetTokenExpires = expiresAt;
  writeAccounts(cuentas);

  try {
    await sendResetEmail(email, token);
    res.json({ message: 'Se envió un correo para restablecer la contraseña' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
});

// POST /api/empleados/reset-password/confirm
router.post('/reset-password/confirm', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  const cuentas = readAccounts();
  const cuenta = cuentas.find((item) => item.resetToken === token);
  if (!cuenta) {
    return res.status(404).json({ error: 'Token inválido' });
  }

  if (cuenta.resetTokenExpires && Date.now() > cuenta.resetTokenExpires) {
    return res.status(400).json({ error: 'El token ha expirado' });
  }

  cuenta.password = newPassword;
  cuenta.resetToken = null;
  cuenta.resetTokenExpires = null;
  writeAccounts(cuentas);

  res.json({ message: 'Contraseña actualizada correctamente' });
});

module.exports = router;