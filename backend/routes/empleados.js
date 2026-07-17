const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

const router = express.Router();

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return '';
  }

  const trimmedRole = role.trim().toLowerCase();
  const aliases = {
    administrador: 'Administrador',
    adminsitrador: 'Administrador',
    admin: 'Administrador',
    socio: 'Socio',
    ventas: 'Ventas',
    vendedor: 'Ventas',
    vendedores: 'Ventas',
  };

  return aliases[trimmedRole] || role.trim();
}

function isAdminActor(role) {
  return normalizeRole(role) === 'Administrador';
}

function isSelfUpdate(actorEmail, targetEmail) {
  return Boolean(actorEmail && targetEmail && actorEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase());
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
  try {
    const derived = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

function generatePassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#?';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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

// GET /api/empleados - Obtener todos los empleados
router.get('/', async (req, res) => {
  const actorRole = req.query.actorRole || '';

  if (!isAdminActor(actorRole)) {
    return res.status(403).json({ error: 'Solo los administradores pueden ver empleados' });
  }

  try {
    const [rows] = await pool.execute('SELECT id, nombre, apellido, email, tel, rol FROM empleados');
    res.json(rows);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// POST /api/empleados - Crear empleado
router.post('/', async (req, res) => {
  const { nombre, apellido, email, tel, rol, password, actorRole, actorEmail } = req.body;

  if (!isAdminActor(actorRole)) {
    return res.status(403).json({ error: 'Solo los administradores pueden gestionar empleados' });
  }

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ error: 'Nombre, apellido y correo son obligatorios' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.execute('SELECT id FROM empleados WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe un empleado con este correo' });
    }

    const plainPassword = typeof password === 'string' && password.trim() ? password.trim() : generatePassword();
    const hashedPassword = hashPassword(plainPassword);
    const normalizedRole = normalizeRole(rol) || 'Ventas';

    const [result] = await pool.execute(
      'INSERT INTO empleados (nombre, apellido, email, tel, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), apellido.trim(), normalizedEmail, tel?.trim() || '', normalizedRole]
    );

    await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), apellido.trim(), normalizedEmail, hashedPassword, normalizedRole]
    );

    const empleado = {
      id: result.insertId,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: normalizedEmail,
      tel: tel?.trim() || '',
      rol: normalizedRole,
    };

    res.status(201).json({
      empleado,
      usuario: { ...empleado, password: hashedPassword },
      temporaryPassword: plainPassword,
      message: 'Empleado creado correctamente.',
    });
  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({ error: 'Error al crear empleado' });
  }
});

// POST /api/empleados/login - Login de usuario (usa tabla usuarios)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await pool.execute(
      'SELECT id, nombre, apellido, email, password, rol FROM usuarios WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const empleado = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: normalizeRole(user.rol),
    };

    res.json({
      ok: true,
      usuario: empleado,
      empleado,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login' });
  }
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

// POST /api/empleados/request-reset - Solicitar reset de contraseña
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await pool.execute(
      'SELECT id, email FROM usuarios WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'No existe un usuario con ese correo' });
    }

    const user = users[0];
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60;

    // Guardar el token (considera agregar tabla para reset tokens)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    const mailResult = await sendResetEmail(user.email, resetLink);

    res.json({
      ok: mailResult.ok,
      message: mailResult.ok
        ? 'Correo de reset enviado. Revisa tu bandeja de entrada.'
        : 'No se pudo enviar el correo. Intenta más tarde.',
      mailResult,
    });
  } catch (error) {
    console.error('Error solicitando reset:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// POST /api/empleados/reset-password - Cambiar contraseña con token
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos para actualizar la contraseña' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Nota: aquí necesitarías validar el token contra una tabla de reset_tokens
    // Por ahora solo cambiaremos la contraseña
    const hashedPassword = hashPassword(newPassword);
    
    const [result] = await pool.execute(
      'UPDATE usuarios SET password = ? WHERE LOWER(email) = ?',
      [hashedPassword, normalizedEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No existe un usuario con ese correo' });
    }

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
});

// POST /api/empleados/change-password - Cambiar contraseña (requiere contraseña actual)
router.post('/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos para cambiar la contraseña' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await pool.execute(
      'SELECT id, password FROM usuarios WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'No existe un usuario con ese correo' });
    }

    const user = users[0];

    if (!verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = hashPassword(newPassword);
    await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    res.json({ message: 'Contraseña cambiada correctamente.' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

// GET /api/empleados/:id - Obtener empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, apellido, email, tel, rol FROM empleados WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
});

// PUT /api/empleados/:id - Actualizar empleado
router.put('/:id', async (req, res) => {
  const { nombre, apellido, email, tel, rol, actorRole, actorEmail } = req.body;

  try {
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre.trim());
    }
    if (apellido !== undefined) {
      updates.push('apellido = ?');
      values.push(apellido.trim());
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email.trim().toLowerCase());
    }
    if (tel !== undefined) {
      updates.push('tel = ?');
      values.push(tel.trim());
    }
    if (rol !== undefined) {
      updates.push('rol = ?');
      values.push(normalizeRole(rol));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const employeeIdParam = Number(req.params.id);
    let employeeRow = null;

    if (!Number.isNaN(employeeIdParam)) {
      const [rows] = await pool.execute('SELECT id, email FROM empleados WHERE id = ?', [employeeIdParam]);
      employeeRow = rows[0];
    }

    if (!employeeRow && email) {
      const [rows] = await pool.execute('SELECT id, email FROM empleados WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
      employeeRow = rows[0];
    }

    if (!employeeRow) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const targetEmail = email?.trim().toLowerCase() || employeeRow.email;
    const canManageEmployee = isAdminActor(actorRole) || isSelfUpdate(actorEmail, targetEmail);

    if (!canManageEmployee) {
      return res.status(403).json({ error: 'Solo los administradores pueden modificar empleados' });
    }

    values.push(employeeRow.id);
    const query = `UPDATE empleados SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const userUpdates = [];
    const userValues = [];

    if (nombre !== undefined) {
      userUpdates.push('nombre = ?');
      userValues.push(nombre.trim());
    }
    if (apellido !== undefined) {
      userUpdates.push('apellido = ?');
      userValues.push(apellido.trim());
    }
    if (email !== undefined) {
      userUpdates.push('email = ?');
      userValues.push(email.trim().toLowerCase());
    }
    if (tel !== undefined) {
      userUpdates.push('tel = ?');
      userValues.push(tel.trim());
    }
    if (rol !== undefined) {
      userUpdates.push('rol = ?');
      userValues.push(normalizeRole(rol));
    }

    if (userUpdates.length > 0) {
      userValues.push(targetEmail);
      await pool.execute(`UPDATE usuarios SET ${userUpdates.join(', ')} WHERE LOWER(email) = ?`, userValues);
    }

    const [updated] = await pool.execute(
      'SELECT id, nombre, apellido, email, tel, rol FROM empleados WHERE id = ?',
      [employeeRow.id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

// DELETE /api/empleados/:id - Eliminar empleado
router.delete('/:id', async (req, res) => {
  const { actorRole, actorEmail } = req.body;

  if (!isAdminActor(actorRole)) {
    return res.status(403).json({ error: 'Solo los administradores pueden eliminar empleados' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM empleados WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

module.exports = router;