# Proyecto Ecommerce - Sistema de Autenticación y Autorización

## Descripción
Proyecto backend de ecommerce con sistema completo de autenticación mediante JWT y Passport.js, incluyendo gestión de usuarios y carritos de compra.

## Tecnologías Utilizadas
- Node.js
- Express.js
- MongoDB con Mongoose
- Passport.js (Local Strategy, JWT Strategy, GitHub Strategy)
- bcrypt para encriptación de contraseñas
- JWT (JSON Web Tokens)
- Express Handlebars para vistas
- Express Session y Cookie Parser

## Características Implementadas

### ✅ 1. Modelo de Usuario
El modelo `User` incluye todos los campos requeridos:
- `first_name`: String (requerido)
- `last_name`: String
- `email`: String (único, requerido)
- `age`: Number (requerido)
- `password`: String (encriptado con bcrypt)
- `cart`: ObjectId (referencia a colección Carts)
- `role`: String (valor por defecto: 'user')

**Ubicación**: `src/models/user.model.js`

### ✅ 2. Encriptación de Contraseñas
- Utiliza `bcrypt.hashSync()` para encriptar contraseñas
- Implementado en `src/utils.js`:
  - `createHash()`: Encripta la contraseña
  - `isValidPassword()`: Valida contraseña contra hash almacenado

### ✅ 3. Estrategias de Passport

#### Estrategia Local - Login
- Autentica usuario mediante email y contraseña
- Valida credenciales contra base de datos
- Verifica hash de contraseña con bcrypt

#### Estrategia Local - Register
- Registra nuevos usuarios
- Encripta contraseña automáticamente
- Crea carrito vacío para el usuario
- Previene duplicación de emails

#### Estrategia JWT
- Valida tokens JWT para rutas protegidas
- Extrae token desde cookies o header Authorization
- Utiliza `cookieExtractor` personalizado
- Secret key: "coderSecret"

#### Estrategia GitHub OAuth
- Autenticación mediante GitHub
- Crea usuario automáticamente si no existe
- Genera carrito para nuevos usuarios
- Genera JWT tras autenticación exitosa

**Ubicación**: `src/config/passport.config.js`

### ✅ 4. Sistema de Login con JWT

#### Endpoint: POST `/api/sessions/login`
**Request Body**:
```json
{
  "email": "usuario@email.com",
  "password": "contraseña"
}
```

**Response Success**:
```json
{
  "status": "success",
  "payload": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "usuario@email.com",
    "age": 25,
    "role": "user",
    "cart": "64f8a3b2c1d2e3f4a5b6c7d8"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Características**:
- Genera token JWT válido por 2 horas
- Almacena token en cookie httpOnly
- Incluye datos del usuario en el payload del JWT
- Redirige a `/current` si es petición HTML

### ✅ 5. Endpoint /api/sessions/current

#### GET `/api/sessions/current`
Valida y retorna información del usuario autenticado mediante JWT.

**Headers**:
```
Authorization: Bearer <token>
```
O cookie con nombre `token`

**Response Success**:
```json
{
  "status": "success",
  "message": "Usuario autenticado correctamente",
  "payload": {
    "id": "64f8a3b2c1d2e3f4a5b6c7d8",
    "email": "usuario@email.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user"
  }
}
```

**Response Error (401)**:
```json
{
  "error": "No auth token"
}
```

## Endpoints Disponibles

### Autenticación
- `POST /api/sessions/register` - Registrar nuevo usuario
- `POST /api/sessions/login` - Iniciar sesión
- `GET /api/sessions/current` - Obtener usuario actual (requiere JWT)
- `GET /api/sessions/logout` - Cerrar sesión
- `GET /api/sessions/github` - Login con GitHub
- `GET /api/sessions/github/callback` - Callback de GitHub

### Vistas
- `GET /` - Página de inicio
- `GET /login` - Vista de login
- `GET /register` - Vista de registro
- `GET /current` - Vista del usuario actual (requiere JWT)

## Estructura del Proyecto
```
Backend2/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── passport.config.js      # Configuración de estrategias Passport
│   ├── middleware/
│   │   └── auth.js                 # Middlewares de autenticación
│   ├── models/
│   │   ├── user.model.js           # Modelo de Usuario
│   │   └── cart.model.js           # Modelo de Carrito
│   ├── routes/
│   │   ├── views.js                # Rutas de vistas
│   │   └── api/
│   │       └── sessions.js         # Rutas de sesiones/auth
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars
│   │   ├── home.handlebars
│   │   ├── login.handlebars
│   │   ├── register.handlebars
│   │   └── current.handlebars
│   ├── app.js                      # Configuración de Express
│   ├── server.js                   # Servidor y conexión MongoDB
│   └── utils.js                    # Utilidades (bcrypt, passportCall)
├── public/                         # Archivos estáticos
├── package.json
└── README.md
```

## Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd Backend2
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` (opcional):
```env
PORT=8080
MONGO_URI=mongodb+srv://tu-conexion
JWT_SECRET=coderSecret
GITHUB_CLIENT_ID=tu-client-id
GITHUB_CLIENT_SECRET=tu-client-secret
```

### 4. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

## Dependencias Principales
```json
{
  "express": "^4.x.x",
  "mongoose": "^8.x.x",
  "passport": "^0.7.x",
  "passport-local": "^1.x.x",
  "passport-jwt": "^4.x.x",
  "passport-github2": "^0.x.x",
  "bcrypt": "^5.x.x",
  "jsonwebtoken": "^9.x.x",
  "express-handlebars": "^7.x.x",
  "express-session": "^1.x.x",
  "cookie-parser": "^1.x.x"
}
```

## Flujo de Autenticación

### Registro de Usuario
1. Usuario completa formulario de registro
2. Sistema valida que email no exista
3. Contraseña se encripta con bcrypt
4. Se crea carrito vacío automáticamente
5. Usuario se guarda en base de datos
6. Respuesta exitosa

### Login
1. Usuario ingresa email y contraseña
2. Sistema busca usuario por email
3. Valida contraseña con bcrypt.compareSync()
4. Genera token JWT con datos del usuario
5. Token se almacena en cookie httpOnly
6. Usuario puede acceder a rutas protegidas

### Acceso a Ruta Protegida
1. Cliente envía petición con token JWT
2. Middleware `passportCall('jwt')` extrae token
3. Passport valida token y extrae payload
4. Si es válido, `req.user` contiene datos del usuario
5. Controlador procesa petición
6. Respuesta con datos solicitados

## Pruebas con Postman/Insomnia

### 1. Registrar Usuario
```
POST http://localhost:8080/api/sessions/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@email.com",
  "age": 25,
  "password": "123456"
}
```

### 2. Login
```
POST http://localhost:8080/api/sessions/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "123456"
}
```
Copiar el `token` de la respuesta.

### 3. Obtener Usuario Actual
```
GET http://localhost:8080/api/sessions/current
Authorization: Bearer <tu-token-aqui>
```

## Seguridad Implementada

### Contraseñas
- ✅ Encriptación con bcrypt (10 rounds)
- ✅ Nunca se retorna password en respuestas
- ✅ Validación con hash almacenado

### JWT
- ✅ Token almacenado en cookie httpOnly
- ✅ Expiración de 2 horas
- ✅ Secret key para firma
- ✅ Validación en cada petición protegida

### Passport
- ✅ Estrategias separadas por tipo de autenticación
- ✅ Manejo de errores apropiado
- ✅ Sesiones deshabilitadas para JWT (stateless)

## Modelo de Datos

### Usuario
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String (unique),
  age: Number,
  password: String (hash),
  cart: ObjectId (ref: 'carts'),
  role: String (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Carrito
```javascript
{
  _id: ObjectId,
  products: [{
    product: ObjectId (ref: 'products'),
    quantity: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Cumplimiento de Criterios de Evaluación

### ✅ Modelo de Usuario y Encriptación
- [x] Modelo User con todos los campos especificados
- [x] Encriptación con bcrypt.hashSync()
- [x] Contraseña almacenada de forma segura
- [x] Campo cart con referencia a Carts
- [x] Role con valor por defecto 'user'

### ✅ Estrategias de Passport
- [x] Estrategia local para login
- [x] Estrategia local para registro
- [x] Estrategia JWT para autenticación
- [x] Estrategia GitHub OAuth (adicional)
- [x] Correcta configuración y funcionamiento

### ✅ Sistema de Login y JWT
- [x] Login genera token JWT válido
- [x] Token almacenado en cookie httpOnly
- [x] Token incluye datos del usuario en payload
- [x] Expiración configurada (2 horas)
- [x] Token utilizable para rutas protegidas

### ✅ Estrategia Current y Endpoint
- [x] Endpoint /api/sessions/current implementado
- [x] Valida token JWT correctamente
- [x] Extrae y retorna datos del usuario
- [x] Manejo de errores apropiado (401 para token inválido)
- [x] Respuesta JSON estructurada

## Autor
Nicolas Saez

## Licencia
MIT
