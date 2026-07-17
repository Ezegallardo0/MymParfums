-- Script para crear las tablas en MySQL
-- Ejecutar en MySQL Workbench o en la terminal

USE mymparfums;

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  imagen VARCHAR(255),
  categoria ENUM('Destacadas', 'Armaf & Afnan', 'Lattafa & Maison Alhambra') DEFAULT 'Destacadas'
);

-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  tel VARCHAR(20) NOT NULL,
  rol ENUM('Administrador', 'Socio', 'Ventas') NOT NULL DEFAULT 'Ventas'
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('Administrador', 'Socio', 'Ventas') NOT NULL DEFAULT 'Ventas'
);

-- Crear tabla de registro (transacciones/ventas)
CREATE TABLE IF NOT EXISTS registro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  producto_id INT NOT NULL,
  empleado_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('Pendiente', 'Completada', 'Cancelada') DEFAULT 'Completada',
  metodo_pago ENUM('Efectivo', 'Transferencia', 'Tarjeta') NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);
