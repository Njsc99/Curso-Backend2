# Proyecto Backend - Entrega Final

## Descripción
Backend de un ecommerce con arquitectura profesional, implementando patrones de diseño (Repository, DTO), autenticación JWT, autorización por roles y sistema de compras con tickets.

## Características Implementadas

### 1. Arquitectura en Capas
- **DAOs (Data Access Objects)**: Capa de acceso a datos en `src/dao/`
- **Repositories**: Patrón Repository en `src/repositories/` que usa los DAOs
- **DTOs (Data Transfer Objects)**: Objetos de transferencia en `src/dto/` para no exponer información sensible
- **Models**: Modelos de Mongoose en `src/models/`
- **Routes**: Rutas API organizadas en `src/routes/api/`
- **Middleware**: Autenticación y autorización en `src/middleware/`

### 2. Sistema de Autenticación y Autorización
- JWT con estrategia Passport
- Roles: `user` y `admin`
- Middleware de autorización por roles
- Ruta `/current` con UserDTO (sin información sensible)

### 3. Sistema de Recuperación de Contraseña
- Endpoint: `POST /api/sessions/forgot-password`
- Envío de email con link de recuperación
- Token que expira en 1 hora
- Validación para no usar la misma contraseña anterior
- Endpoint: `POST /api/sessions/reset-password/:token`

### 4. Gestión de Productos (Solo Admin)
- `POST /api/products` - Crear producto
- `PUT /api/products/:pid` - Actualizar producto
- `DELETE /api/products/:pid` - Eliminar producto
- `GET /api/products` - Listar productos (público)
- `GET /api/products/:pid` - Ver producto (público)

### 5. Gestión de Carritos (Solo Users)
- `GET /api/carts/:cid` - Ver carrito
- `POST /api/carts/:cid/product/:pid` - Agregar producto al carrito
- `PUT /api/carts/:cid/product/:pid` - Actualizar cantidad
- `DELETE /api/carts/:cid/product/:pid` - Eliminar producto del carrito
- `DELETE /api/carts/:cid` - Vaciar carrito

### 6. Sistema de Compras
- `POST /api/carts/:cid/purchase` - Finalizar compra
- Verificación de stock de productos
- Generación de ticket con código único
- Manejo de compras parciales (algunos productos sin stock)
- Actualización automática de stock
- Envío de email de confirmación

### 7. Modelos de Datos

#### User
- first_name, last_name, email, age, password
- role: 'user' | 'admin'
- cart: referencia al carrito

#### Product
- title, description, price, stock, category, code
- owner: email del creador

#### Cart
- products: array de { product, quantity }

#### Ticket
- code: UUID único
- purchase_datetime: fecha de compra
- amount: monto total
- purchaser: email del comprador
- products: array de productos comprados

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Ejecutar en desarrollo
npm start
```

## Variables de Entorno

Ver archivo `.env.example` para todas las variables necesarias:
- `MONGODB_URI`: Conexión a MongoDB
- `JWT_SECRET`: Secreto para tokens JWT
- `EMAIL_USER` y `EMAIL_PASS`: Credenciales para envío de emails
- `BASE_URL`: URL base del servidor
- `PORT`: Puerto del servidor

## Configuración de Email (Gmail)

Para usar el sistema de recuperación de contraseña:
1. Ir a tu cuenta de Google
2. Activar verificación en 2 pasos
3. Generar una "Contraseña de aplicación"
4. Usar esa contraseña en `EMAIL_PASS`

## Endpoints Principales

### Autenticación
- `POST /api/sessions/register` - Registrar usuario
- `POST /api/sessions/login` - Iniciar sesión
- `GET /api/sessions/current` - Obtener usuario actual (JWT)
- `GET /api/sessions/logout` - Cerrar sesión
- `POST /api/sessions/forgot-password` - Solicitar recuperación
- `POST /api/sessions/reset-password/:token` - Restablecer contraseña

### Productos (Admin)
- `POST /api/products` - Crear (requiere admin)
- `PUT /api/products/:pid` - Actualizar (requiere admin)
- `DELETE /api/products/:pid` - Eliminar (requiere admin)
- `GET /api/products` - Listar (público)

### Carritos (User)
- `POST /api/carts/:cid/product/:pid` - Agregar producto (requiere user)
- `POST /api/carts/:cid/purchase` - Finalizar compra (requiere user)

## Estructura del Proyecto

```
src/
├── dao/                    # Data Access Objects
│   ├── user.dao.js
│   ├── cart.dao.js
│   ├── product.dao.js
│   └── ticket.dao.js
├── repositories/           # Patrón Repository
│   ├── user.repository.js
│   ├── cart.repository.js
│   ├── product.repository.js
│   └── ticket.repository.js
├── dto/                    # Data Transfer Objects
│   ├── user.dto.js
│   ├── product.dto.js
│   └── ticket.dto.js
├── models/                 # Modelos Mongoose
│   ├── user.model.js
│   ├── cart.model.js
│   ├── product.model.js
│   ├── ticket.model.js
│   └── passwordReset.model.js
├── routes/
│   └── api/
│       ├── sessions.js     # Autenticación
│       ├── products.js     # Productos
│       └── carts.js        # Carritos y compras
├── middleware/
│   └── auth.js            # Autorización
├── config/
│   └── passport.config.js # Configuración Passport
├── utils/
│   └── mailer.js          # Envío de emails
├── app.js                 # Configuración Express
└── server.js              # Entrada de la aplicación
```

## Patrones de Diseño Implementados

1. **Repository Pattern**: Separa la lógica de negocio del acceso a datos
2. **DTO Pattern**: Evita exponer información sensible en las respuestas
3. **Middleware Pattern**: Autorización modular y reutilizable
4. **Singleton Pattern**: Instancias únicas de DAOs y Repositories

## Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación stateless
- Tokens de recuperación con expiración
- DTOs para no exponer información sensible
- Validación de permisos por rol
- httpOnly cookies para JWT

## Testing Manual

### Crear usuario admin manualmente
```javascript
// En MongoDB, actualizar un usuario:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Flujo de compra
1. Registrar usuario (obtienes cart_id)
2. Login (obtienes token JWT)
3. Admin crea productos
4. User agrega productos al carrito
5. User finaliza compra: `POST /api/carts/{cart_id}/purchase`
6. Se genera ticket y se envía email

## Notas

- El sistema maneja compras parciales cuando hay productos sin stock
- Los tokens de recuperación expiran en 1 hora automáticamente
- Los emails se envían de forma asíncrona
- El stock se actualiza automáticamente al realizar compra
