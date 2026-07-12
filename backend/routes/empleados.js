const express = require('express');
const fs = require('fs');
const path = require('path');

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

// GET /api/empleados
router.get('/', (req, res) => {
  const empleados = readData();
  res.json(empleados);
});

// GET /api/empleados/:id
router.get('/:id', (req, res) => {
  const empleados = readData();
  const empleado = empleados.find((item) => item.id === req.params.id);
  if (!empleado) {
    return res.status(404).json({ error: 'Empleado no encontrado' });
  }
  res.json(empleado);
});

// POST /api/empleados
router.post('/', (req, res) => {
  const { nombre, apellido, email, tel, rol } = req.body;
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
  }

  const empleados = readData();
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

  res.status(201).json(nuevoEmpleado);
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
  res.status(204).end();
});

module.exports = router;