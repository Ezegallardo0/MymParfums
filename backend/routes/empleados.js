const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/empleados.json');

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#?';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function serializeEmployee(empleado) {
  if (!empleado) return null;
  const { passwordHash, resetToken, resetTokenExpiresAt, ...rest } = empleado;
  return rest;
}

function createMailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendResetEmail(email, resetLink) {
  const transporter = createMailTransporter();
  const from = process.env.EMAIL_FROM || 'soporte@mymparfums.com';

  if (!transporter) {
    console.log(`[mail] SMTP no configurado. Envío simulado para ${email}: ${resetLink}`);
    return { ok: true, simulated: true, message: 'SMTP no configurado. No se envió el correo real.' };
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Recupera tu contraseña',
      html: `<p>Haz clic en el siguiente enlace para cambiar tu contraseña:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    return { ok: true, simulated: false };
  } catch (error) {
    console.error('[mail] Error enviando correo:', error.message);
    return { ok: false, simulated: false, error: error.message };
  }
}

// GET /api/empleados
router.get('/', (req, res) => {
  const empleados = readData();
  res.json(empleados.map(serializeEmployee));
});

// POST /api/empleados
router.post('/', async (req, res) => {
  const { nombre, apellido, email, tel, rol, password } = req.body;
  if (!nombre || !apellido || !email) {
    return res.status(400).json({ error: 'Nombre, apellido y correo son obligatorios' });
  }

  const empleados = readData();
  const normalizedEmail = email.trim().toLowerCase();
  const exists = empleados.some((emp) => emp.email?.toLowerCase() === normalizedEmail);

  if (exists) {
    return res.status(409).json({ error: 'Ya existe un empleado con este correo' });
  }

  const generatedPassword = password || generatePassword();
  const nuevoEmpleado = {
    id: Date.now().toString(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    email: normalizedEmail,
    tel: tel ? tel.trim() : '',
    rol: rol ? rol.trim() : 'Ventas',
    passwordHash: hashPassword(generatedPassword),
    resetToken: null,
    resetTokenExpiresAt: null,
    createdAt: new Date().toISOString(),
  };

  empleados.push(nuevoEmpleado);
  writeData(empleados);

  res.status(201).json({
    empleado: serializeEmployee(nuevoEmpleado),
    temporaryPassword: generatedPassword,
    message: 'Empleado creado correctamente. Se generó una contraseña temporal.',
  });
});

// POST /api/empleados/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const empleados = readData();
  const empleado = empleados.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());

  if (!empleado || !verifyPassword(password, empleado.passwordHash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  res.json({
    ok: true,
    empleado: serializeEmployee(empleado),
  });
});

// POST /api/empleados/test-mail
router.post('/test-mail', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  const mailResult = await sendResetEmail(email, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);

  res.json({
    ok: mailResult.ok,
    message: mailResult.ok
      ? (mailResult.simulated
        ? 'SMTP no está configurado. No se envió un correo real.'
        : 'Correo de prueba enviado correctamente.')
      : 'No se pudo enviar el correo. Revisa la configuración SMTP.',
    mailResult,
  });
});

// POST /api/empleados/request-reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  const empleados = readData();
  const empleado = empleados.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());
  if (!empleado) {
    return res.status(404).json({ error: 'No existe un empleado con ese correo' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60;
  empleado.resetToken = token;
  empleado.resetTokenExpiresAt = expiresAt;
  writeData(empleados);

  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(empleado.email)}`;
  const mailResult = await sendResetEmail(empleado.email, resetLink);

  res.json({
    message: mailResult.ok
      ? (mailResult.simulated
        ? 'Se preparó el enlace de recuperación, pero SMTP no está configurado para enviar el correo real.'
        : 'Se envió un correo con instrucciones para cambiar la contraseña.')
      : 'No se pudo enviar el correo. Revisa la configuración SMTP.',
    resetLink,
    mailResult,
  });
});

// POST /api/empleados/reset-password
router.post('/reset-password', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos para actualizar la contraseña' });
  }

  const empleados = readData();
  const empleado = empleados.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());
  if (!empleado) {
    return res.status(404).json({ error: 'No existe un empleado con ese correo' });
  }

  const isValidToken = empleado.resetToken === token && Number(empleado.resetTokenExpiresAt || 0) > Date.now();
  if (!isValidToken) {
    return res.status(410).json({ error: 'El enlace para recuperar la contraseña ya no es válido' });
  }

  empleado.passwordHash = hashPassword(newPassword);
  empleado.resetToken = null;
  empleado.resetTokenExpiresAt = null;
  writeData(empleados);

  res.json({ message: 'Contraseña actualizada correctamente.' });
});

// POST /api/empleados/change-password
router.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos para cambiar la contraseña' });
  }

  const empleados = readData();
  const empleado = empleados.find((item) => item.email?.toLowerCase() === email.trim().toLowerCase());
  if (!empleado) {
    return res.status(404).json({ error: 'No existe un empleado con ese correo' });
  }

  if (!verifyPassword(currentPassword, empleado.passwordHash)) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
  }

  empleado.passwordHash = hashPassword(newPassword);
  writeData(empleados);

  res.json({ message: 'Contraseña cambiada correctamente.' });
});

// GET /api/empleados/:id
router.get('/:id', (req, res) => {
  const empleados = readData();
  const empleado = empleados.find((emp) => emp.id === req.params.id);

  if (!empleado) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  res.json(serializeEmployee(empleado));
});

// PUT /api/empleados/:id
router.put('/:id', (req, res) => {
  const empleados = readData();
  const index = empleados.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  const { nombre, apellido, email, tel, rol, password } = req.body;

  empleados[index] = {
    ...empleados[index],
    nombre: nombre !== undefined ? nombre.trim() : empleados[index].nombre,
    apellido: apellido !== undefined ? apellido.trim() : empleados[index].apellido,
    email: email !== undefined ? email.trim().toLowerCase() : empleados[index].email,
    tel: tel !== undefined ? tel.trim() : empleados[index].tel,
    rol: rol !== undefined ? rol.trim() : empleados[index].rol,
  };

  if (password) {
    empleados[index].passwordHash = hashPassword(password);
  }

  writeData(empleados);
  res.json(serializeEmployee(empleados[index]));
});

// DELETE /api/empleados/:id
router.delete('/:id', (req, res) => {
  const empleados = readData();
  const filtered = empleados.filter((item) => item.id !== req.params.id);

  if (filtered.length === empleados.length) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }

  writeData(filtered);
  res.status(204).end();
});

module.exports = router;