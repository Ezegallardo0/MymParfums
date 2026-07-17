# Guía de Migración de Rutas a Base de Datos

## ✅ Cambios Realizados

Se ha migrado exitosamente tu aplicación de archivos JSON a MySQL. Los cambios incluyen:

### 1. **Configuración de Base de Datos**
- ✅ Actualizado `config/db.js` para usar conexiones con promesas (`mysql2/promise`)
- ✅ Creado pool de conexiones reutilizable
- ✅ Añadidas funciones `testConnection()` e `initializeDatabase()`

### 2. **Rutas Actualizadas**
- ✅ **`/api/empleados`** - Migrada a tabla `empleados`
  - GET / → Obtiene todos los empleados
  - POST / → Crea nuevo empleado
  - GET /:id → Obtiene empleado por ID
  - PUT /:id → Actualiza empleado
  - DELETE /:id → Elimina empleado
  - POST /login → Login con tabla `usuarios`
  - POST /request-reset → Solicita reset de contraseña
  - POST /reset-password → Cambia contraseña con token
  - POST /change-password → Cambia contraseña con contraseña actual

- ✅ **`/api/productos`** - Migrada a tabla `productos`
  - GET / → Obtiene todos los productos
  - GET /:id → Obtiene producto por ID
  - POST / → Crea producto (con manejo de upload de imagen)
  - PUT /:id → Actualiza producto
  - DELETE /:id → Elimina producto

- ✅ **`/api/registro`** - NUEVA ruta para ventas/transacciones
  - GET / → Obtiene todos los registros con detalles de producto y empleado
  - GET /:id → Obtiene registro específico
  - POST / → Crea nuevo registro de venta y actualiza stock automáticamente
  - PUT /:id → Actualiza estado del registro
  - DELETE /:id → Elimina registro y restaura stock

### 3. **Nuevos Archivos**
- ✅ `routes/registro.js` - Ruta completa para manejar transacciones/ventas
- ✅ `migrate.js` - Script para migrar datos de JSON a MySQL
- ✅ `.env.example` - Template de variables de entorno
- ✅ `schema.sql` - Script SQL con estructura de tablas

---

## 🚀 Pasos para Implementar

### 1. **Configurar Variables de Entorno**
```bash
# Copia el archivo .env.example a .env
cp backend/.env.example backend/.env

# Edita backend/.env con tus credenciales de MySQL
```

**Contenido recomendado de `.env`:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1906
DB_NAME=mymparfums
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 2. **Ejecutar la Migración de Datos (Opcional)**
Si aún tienes datos en los archivos JSON y quieres migrarlos a MySQL:

```bash
cd backend
npm run migrate
```

Este script:
- Lee `data/empleados.json`
- Lee `data/productos.json`
- Inserta todos los datos en las tablas MySQL correspondientes
- Usa `INSERT IGNORE` para evitar duplicados

### 3. **Iniciar el Servidor**
```bash
cd backend
npm start
# O con nodemon (auto-reload en cambios):
npm run dev
```

---

## 📋 Estructura de Datos

### Tabla: `empleados`
```sql
id (INT, auto_increment, PK)
nombre (VARCHAR 100)
apellido (VARCHAR 100)
email (VARCHAR 150, UNIQUE)
tel (VARCHAR 20)
rol (ENUM: "Administrador", "Socio", "Ventas")
```

### Tabla: `usuarios`
```sql
id (INT, auto_increment, PK)
nombre (VARCHAR 100)
apellido (VARCHAR 100)
email (VARCHAR 150, UNIQUE)
password (VARCHAR 255) - Hash con sal
rol (ENUM: "Administrador", "Socio", "Ventas")
```

### Tabla: `productos`
```sql
id (INT, auto_increment, PK)
nombre (VARCHAR 100)
descripcion (TEXT)
precio (DECIMAL 10,2)
stock (INT)
imagen (VARCHAR 255)
categoria (ENUM: "Destacadas", "Armaf & Afnan", "Lattafa & Maison Alhambra")
```

### Tabla: `registro` (Transacciones/Ventas)
```sql
id (INT, auto_increment, PK)
fecha (DATETIME, default: CURRENT_TIMESTAMP)
producto_id (INT, FK → productos)
empleado_id (INT, FK → empleados)
cantidad (INT)
precio_unitario (DECIMAL 10,2)
total (DECIMAL 10,2)
estado (ENUM: "Pendiente", "Completada", "Cancelada")
metodo_pago (ENUM: "Efectivo", "Transferencia", "Tarjeta")
```

---

## 🔐 Cambios en Autenticación

- **Login ahora usa tabla `usuarios`** en lugar de `empleados`
- Las funciones de **hash de contraseña** siguen siendo las mismas
- Se recomienda crear usuarios con contraseñas hasheadas en la tabla `usuarios`

### Crear Usuario de Prueba en MySQL:
```sql
-- Primero necesitas hashear la contraseña en JavaScript o usar una herramienta externa
INSERT INTO usuarios (nombre, apellido, email, password, rol) 
VALUES ('Admin', 'Test', 'admin@test.com', 'hashed_password_here', 'Administrador');
```

---

## 🧪 Probar las Rutas

### Empleados
```bash
# GET todos
curl http://localhost:3000/api/empleados

# POST nuevo
curl -X POST http://localhost:3000/api/empleados \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","email":"juan@test.com","tel":"123456789","rol":"Ventas"}'
```

### Productos
```bash
# GET todos
curl http://localhost:3000/api/productos

# POST nuevo con imagen
curl -X POST http://localhost:3000/api/productos \
  -F "nombre=Perfume X" \
  -F "descripcion=Descripción" \
  -F "precio=50" \
  -F "stock=100" \
  -F "categoria=Destacadas" \
  -F "imagen=@/ruta/imagen.jpg"
```

### Registros/Ventas
```bash
# GET todos
curl http://localhost:3000/api/registro

# POST nueva venta
curl -X POST http://localhost:3000/api/registro \
  -H "Content-Type: application/json" \
  -d '{
    "producto_id": 1,
    "empleado_id": 1,
    "cantidad": 2,
    "precio_unitario": 50.00,
    "metodo_pago": "Efectivo",
    "estado": "Completada"
  }'
```

---

## ⚠️ Notas Importantes

1. **Limpieza de Archivos JSON**: Una vez confirmado que todo funciona, puedes eliminar los archivos en `data/` pero se recomienda hacer backup primero.

2. **Variables de Entorno**: Asegúrate de tener un archivo `.env` en la carpeta `backend/` con las credenciales correctas.

3. **Pool de Conexiones**: Ahora se usa un pool de conexiones que gestiona automáticamente la concurrencia.

4. **Manejo de Errores**: Todos los endpoints devuelven códigos HTTP apropiados y mensajes de error descriptivos.

5. **Stock de Productos**: Cuando se crea un registro de venta, el stock se actualiza automáticamente. Si se elimina un registro, el stock se restaura.

---

## 📞 Soporte

Si encuentras problemas:
- Verifica que MySQL está corriendo: `mysql -u root -p`
- Verifica la conexión: `curl http://localhost:3000/api/db-status`
- Revisa los logs del servidor en la consola
