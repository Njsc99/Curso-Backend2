# Checklist Entrega Final - Backend Ecommerce

## ✅ Requisitos Cumplidos

### 1. ✅ Patrón Repository
- **Ubicación**: `src/dao/` y `src/repositories/`
- **Implementado para**: User, Cart, Product, Ticket
- **DAOs**: Acceso directo a la base de datos
- **Repositories**: Lógica de negocio sobre los DAOs
- **Archivos**:
  - `src/dao/user.dao.js`
  - `src/dao/cart.dao.js`
  - `src/dao/product.dao.js`
  - `src/dao/ticket.dao.js`
  - `src/repositories/user.repository.js`
  - `src/repositories/cart.repository.js`
  - `src/repositories/product.repository.js`
  - `src/repositories/ticket.repository.js`

### 2. ✅ Modificación de /current con DTO
- **Ubicación**: `src/routes/api/sessions.js` línea 58-67
- **DTO**: `src/dto/user.dto.js`
- **Implementación**: Se usa UserDTO que solo expone: id, first_name, last_name, email, age, role, cart
- **NO expone**: password, timestamps, __v

### 3. ✅ Sistema de Recuperación de Contraseña
- **Endpoints**:
  - `POST /api/sessions/forgot-password` - Solicitar recuperación
  - `POST /api/sessions/reset-password/:token` - Restablecer contraseña
- **Modelo**: `src/models/passwordReset.model.js`
- **Mailer**: `src/utils/mailer.js`
- **Vistas**: 
  - `src/views/forgot-password.handlebars`
  - `src/views/reset-password.handlebars`
- **Características**:
  - ✅ Envío de email con link de recuperación
  - ✅ Token expira en 1 hora (TTL automático con MongoDB)
  - ✅ Validación para no usar la misma contraseña anterior
  - ✅ Token de un solo uso (campo `used`)

### 4. ✅ Middleware de Autorización
- **Ubicación**: `src/middleware/auth.js`
- **Funciones**:
  - `authorize(...roles)` - Middleware genérico por roles
  - `isAdmin` - Solo administradores
  - `isUser` - Solo usuarios
- **Integración con JWT**: Trabaja con la estrategia "current" de Passport
- **Aplicado en**:
  - `src/routes/api/products.js` - Solo admin puede crear, actualizar, eliminar
  - `src/routes/api/carts.js` - Solo usuarios pueden agregar al carrito

### 5. ✅ Arquitectura Profesional
- **Capas separadas**:
  - Models (Mongoose)
  - DAOs (Data Access)
  - Repositories (Business Logic)
  - DTOs (Data Transfer)
  - Routes (Controllers)
  - Middleware (Authorization)
  - Utils (Helpers)
- **Variables de entorno**: `.env.example` con todas las configuraciones
- **Mailing**: Sistema de emails con nodemailer
- **Patrón Singleton**: DAOs y Repositories exportados como instancias únicas

### 6. ✅ Modelo de Ticket y Lógica de Compra
- **Modelo**: `src/models/ticket.model.js`
- **Campos**: code (UUID), purchase_datetime, amount, purchaser, products[]
- **Endpoint**: `POST /api/carts/:cid/purchase`
- **Ubicación**: `src/routes/api/carts.js` línea 117-235
- **Lógica implementada**:
  - ✅ Verificación de stock producto por producto
  - ✅ Actualización de stock automática
  - ✅ Generación de ticket con código único (UUID)
  - ✅ Manejo de compras parciales (algunos productos sin stock)
  - ✅ Array de productos comprados
  - ✅ Array de productos fallidos con razón
  - ✅ Limpieza del carrito (solo productos comprados)
  - ✅ Envío de email de confirmación
  - ✅ Cálculo del monto total

### 7. ✅ Roles y Autorización en Endpoints

#### Admin puede:
- ✅ Crear productos: `POST /api/products`
- ✅ Actualizar productos: `PUT /api/products/:pid`
- ✅ Eliminar productos: `DELETE /api/products/:pid`

#### Usuario puede:
- ✅ Agregar productos al carrito: `POST /api/carts/:cid/product/:pid`
- ✅ Actualizar cantidad: `PUT /api/carts/:cid/product/:pid`
- ✅ Eliminar del carrito: `DELETE /api/carts/:cid/product/:pid`
- ✅ Finalizar compra: `POST /api/carts/:cid/purchase`

#### Público:
- ✅ Ver productos: `GET /api/products`
- ✅ Ver producto específico: `GET /api/products/:pid`

### 8. ✅ Modelos Implementados

#### User (`src/models/user.model.js`)
- first_name, last_name, email, age, password
- role: 'user' | 'admin'
- cart: referencia a Cart

#### Product (`src/models/product.model.js`)
- title, description, price, stock, category, code
- owner: email del creador

#### Cart (`src/models/cart.model.js`)
- products: [{ product, quantity }]

#### Ticket (`src/models/ticket.model.js`)
- code (UUID único)
- purchase_datetime
- amount
- purchaser (email)
- products: [{ product, quantity, price }]

#### PasswordReset (`src/models/passwordReset.model.js`)
- userId, token, expiresAt, used

## 📦 Archivos para Entrega

### Repositorio GitHub debe incluir:
```
├── .env.example          ✅ Variables de entorno
├── .gitignore            ✅ Excluye node_modules
├── package.json          ✅ Dependencias
├── README.md             ✅ Documentación completa
├── INSTALL.md            ✅ Guía de instalación
├── src/
│   ├── dao/              ✅ Data Access Objects
│   ├── dto/              ✅ Data Transfer Objects
│   ├── models/           ✅ Modelos Mongoose
│   ├── repositories/     ✅ Patrón Repository
│   ├── routes/           ✅ Endpoints API
│   ├── middleware/       ✅ Autorización
│   ├── config/           ✅ Passport config
│   ├── utils/            ✅ Mailer y helpers
│   ├── views/            ✅ Vistas Handlebars
│   ├── app.js            ✅ Configuración Express
│   ├── server.js         ✅ Entry point
│   └── seed.js           ✅ Datos de prueba
```

### ⚠️ NO incluir en el repositorio:
- ❌ `node_modules/`
- ❌ `.env` (archivo con credenciales reales)
- ✅ Sí incluir `.env.example` (plantilla sin credenciales)

## 🔑 Credenciales de Prueba (después de ejecutar seed)

```
Admin:
  Email: admin@example.com
  Password: admin123

Usuario:
  Email: user@example.com
  Password: user123
```

## 📝 Instrucciones de Instalación para el Profesor

Incluir en el README (ya incluido):

1. Clonar repositorio
2. `npm install`
3. Copiar `.env.example` a `.env` y configurar
4. Ejecutar `npm run seed` (opcional, para datos de prueba)
5. Ejecutar `npm start`
6. Abrir http://localhost:8080

## 🧪 Casos de Prueba Recomendados

### Test 1: Autenticación y /current
1. Registrar usuario
2. Hacer login → Obtener JWT
3. GET /api/sessions/current → Verificar que NO se expone password

### Test 2: Recuperación de contraseña
1. POST /api/sessions/forgot-password con email
2. Verificar email recibido
3. Usar link del email (expira en 1 hora)
4. Intentar usar la misma contraseña → Error
5. Usar nueva contraseña → Éxito

### Test 3: Autorización Admin
1. Login como usuario normal
2. Intentar POST /api/products → 403 Forbidden
3. Login como admin
4. POST /api/products → 201 Created

### Test 4: Autorización Usuario
1. Login como admin
2. Intentar POST /api/carts/{cid}/product/{pid} → 403 Forbidden
3. Login como usuario
4. POST /api/carts/{cid}/product/{pid} → 200 Success

### Test 5: Compra con Stock
1. Login como usuario
2. Agregar productos al carrito
3. POST /api/carts/{cid}/purchase
4. Verificar ticket generado
5. Verificar stock actualizado
6. Verificar email recibido

### Test 6: Compra Parcial (sin stock)
1. Crear producto con stock bajo (ej: 2 unidades)
2. Agregar 5 unidades al carrito
3. POST /api/carts/{cid}/purchase
4. Verificar respuesta con failedProducts
5. Verificar que carrito mantiene productos sin stock

## 📊 Criterios de Evaluación Cubiertos

### ✅ Implementación de DAO y DTO
- DAOs separados por entidad
- DTOs para evitar exponer información sensible
- Transferencia eficiente entre capas
- Minimización de consultas redundantes

### ✅ Patrón Repository
- Separación clara de lógica de acceso y lógica de negocio
- Repositories usan DAOs
- Operaciones coherentes y eficientes

### ✅ Middleware de Autorización
- Integrado con estrategia JWT "current"
- Delimitación de acceso por roles
- Seguro y eficiente

### ✅ Modelo de Ticket y Lógica de Compra
- Ticket con todos los campos requeridos
- Verificación de stock
- Generación de tickets
- Manejo de compras completas e incompletas
- Eficiente y robusto

## 📌 Notas Adicionales

- **Dependencias nuevas**: nodemailer, uuid
- **Base de datos**: MongoDB (local o Atlas)
- **JWT expira en**: 2 horas
- **Token de recuperación expira en**: 1 hora
- **Emails**: Configurar Gmail con contraseña de aplicación

## 🚀 Listo para Entrega

Todos los requisitos de la consigna han sido implementados exitosamente.
El proyecto está listo para ser subido a GitHub y entregado.

**Link del repositorio**: [Incluir aquí tu link de GitHub]
