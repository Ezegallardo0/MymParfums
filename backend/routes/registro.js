const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// GET /api/registro - Obtener todos los registros
router.get('/', async (req, res) => {
  try {
    const [registros] = await pool.execute(`
      SELECT r.*, p.nombre as producto_nombre, e.nombre as empleado_nombre, e.apellido as empleado_apellido
      FROM registro r
      JOIN productos p ON r.producto_id = p.id
      JOIN empleados e ON r.empleado_id = e.id
      ORDER BY r.fecha DESC
    `);
    res.json(registros);
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

// GET /api/registro/:id - Obtener registro por ID
router.get('/:id', async (req, res) => {
  try {
    const [registros] = await pool.execute(`
      SELECT r.*, p.nombre as producto_nombre, e.nombre as empleado_nombre, e.apellido as empleado_apellido
      FROM registro r
      JOIN productos p ON r.producto_id = p.id
      JOIN empleados e ON r.empleado_id = e.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (registros.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    res.json(registros[0]);
  } catch (error) {
    console.error('Error obteniendo registro:', error);
    res.status(500).json({ error: 'Error al obtener registro' });
  }
});

// POST /api/registro - Crear nuevo registro de venta
router.post('/', async (req, res) => {
  const { producto_id, empleado_id, cantidad, precio_unitario, metodo_pago, estado } = req.body;

  if (!producto_id || !empleado_id || !cantidad || precio_unitario === undefined || !metodo_pago) {
    return res.status(400).json({ 
      error: 'Faltan datos. Se requieren: producto_id, empleado_id, cantidad, precio_unitario, metodo_pago' 
    });
  }

  try {
    // Verificar que el producto existe
    const [productos] = await pool.execute('SELECT stock FROM productos WHERE id = ?', [producto_id]);
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que el empleado existe
    const [empleados] = await pool.execute('SELECT id FROM empleados WHERE id = ?', [empleado_id]);
    if (empleados.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const total = cantidad * precio_unitario;

    const [result] = await pool.execute(
      `INSERT INTO registro (producto_id, empleado_id, cantidad, precio_unitario, total, metodo_pago, estado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [producto_id, empleado_id, cantidad, precio_unitario, total, metodo_pago, estado || 'Completada']
    );

    // Actualizar stock del producto
    await pool.execute(
      'UPDATE productos SET stock = stock - ? WHERE id = ?',
      [cantidad, producto_id]
    );

    res.status(201).json({
      id: result.insertId,
      producto_id,
      empleado_id,
      cantidad,
      precio_unitario,
      total,
      metodo_pago,
      estado: estado || 'Completada',
      fecha: new Date().toISOString(),
      message: 'Registro creado correctamente y stock actualizado',
    });
  } catch (error) {
    console.error('Error creando registro:', error);
    res.status(500).json({ error: 'Error al crear registro' });
  }
});

// PUT /api/registro/:id - Actualizar estado de registro
router.put('/:id', async (req, res) => {
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE registro SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    // Obtener registro actualizado
    const [updated] = await pool.execute(`
      SELECT r.*, p.nombre as producto_nombre, e.nombre as empleado_nombre, e.apellido as empleado_apellido
      FROM registro r
      JOIN productos p ON r.producto_id = p.id
      JOIN empleados e ON r.empleado_id = e.id
      WHERE r.id = ?
    `, [req.params.id]);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error actualizando registro:', error);
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
});

// DELETE /api/registro/:id - Eliminar registro
router.delete('/:id', async (req, res) => {
  try {
    // Obtener el registro para restaurar el stock
    const [registros] = await pool.execute(
      'SELECT producto_id, cantidad FROM registro WHERE id = ?',
      [req.params.id]
    );

    if (registros.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const { producto_id, cantidad } = registros[0];

    // Restaurar el stock
    await pool.execute(
      'UPDATE productos SET stock = stock + ? WHERE id = ?',
      [cantidad, producto_id]
    );

    // Eliminar el registro
    await pool.execute('DELETE FROM registro WHERE id = ?', [req.params.id]);

    res.json({ message: 'Registro eliminado correctamente y stock restaurado' });
  } catch (error) {
    console.error('Error eliminando registro:', error);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});

module.exports = router;
