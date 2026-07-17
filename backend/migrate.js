require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1906',
  database: process.env.DB_NAME || 'mymparfums',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function migrateData() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Leer datos de empleados.json
    const empleadosPath = path.join(__dirname, 'data/empleados.json');
    const productosPath = path.join(__dirname, 'data/productos.json');

    let empleados = [];
    let productos = [];

    if (fs.existsSync(empleadosPath)) {
      const rawEmpleados = fs.readFileSync(empleadosPath, 'utf8');
      empleados = JSON.parse(rawEmpleados || '[]');
    }

    if (fs.existsSync(productosPath)) {
      const rawProductos = fs.readFileSync(productosPath, 'utf8');
      productos = JSON.parse(rawProductos || '[]');
    }

    // Migrar empleados
    console.log(`📦 Migrando ${empleados.length} empleados...`);
    for (const emp of empleados) {
      try {
        await connection.execute(
          `INSERT IGNORE INTO empleados (nombre, apellido, email, tel, rol) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            emp.nombre,
            emp.apellido,
            emp.email,
            emp.tel || '',
            emp.rol || 'Ventas',
          ]
        );
      } catch (err) {
        console.warn(`⚠️  Advertencia en empleado ${emp.email}:`, err.message);
      }
    }
    console.log('✅ Empleados migrados exitosamente');

    // Migrar productos
    console.log(`📦 Migrando ${productos.length} productos...`);
    for (const prod of productos) {
      try {
        await connection.execute(
          `INSERT IGNORE INTO productos (nombre, descripcion, precio, stock, imagen, categoria) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            prod.nombre,
            prod.descripcion || null,
            prod.precio || 0,
            prod.stock || 0,
            prod.imagen || prod.img || null,
            prod.categoria || 'Destacadas',
          ]
        );
      } catch (err) {
        console.warn(`⚠️  Advertencia en producto ${prod.nombre}:`, err.message);
      }
    }
    console.log('✅ Productos migrados exitosamente');

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log('✨ Todos tus datos han sido transferidos a MySQL.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrateData();
