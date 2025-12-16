# Guía de Instalación y Configuración

## Paso 1: Instalar Dependencias

Si tienes problemas con PowerShell, ejecuta esto primero como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego instala las dependencias:
```bash
npm install
```

## Paso 2: Configurar Variables de Entorno

1. Copia el archivo `.env.example` y renómbralo a `.env`
2. Edita el archivo `.env` con tus valores:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecommerce
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/ecommerce

# JWT
JWT_SECRET=mi_secreto_super_seguro_12345

# Server
PORT=8080
BASE_URL=http://localhost:8080

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret

# Session
SESSION_SECRET=mi_session_secret
```

## Paso 3: Configurar Email (Gmail)

Para que funcione el sistema de recuperación de contraseña:

1. Ve a https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (actívala si no lo está)
3. Contraseñas de aplicaciones
4. Genera una contraseña para "Correo"
5. Usa esa contraseña (16 caracteres) en `EMAIL_PASS` del archivo `.env`

## Paso 4: Iniciar MongoDB

Asegúrate de tener MongoDB corriendo:
```bash
# Si usas MongoDB local
mongod

# O si usas MongoDB Atlas, solo necesitas la URI correcta
```

## Paso 5: Popular la Base de Datos (Opcional)

Para crear usuarios y productos de prueba:
```bash
npm run seed
```

Esto creará:
- **Admin**: admin@example.com / admin123
- **Usuario**: user@example.com / user123
- 5 productos de ejemplo

## Paso 6: Iniciar el Servidor

```bash
npm start
```

El servidor estará disponible en http://localhost:8080

## Endpoints Principales

### Vistas Web
- `GET /` - Inicio
- `GET /login` - Login
- `GET /register` - Registro
- `GET /current` - Perfil de usuario (requiere JWT)
- `GET /forgot-password` - Recuperar contraseña
- `GET /reset-password/:token` - Restablecer contraseña

### API - Autenticación
- `POST /api/sessions/register` - Registrar usuario
- `POST /api/sessions/login` - Login (devuelve JWT)
- `GET /api/sessions/current` - Usuario actual
- `POST /api/sessions/forgot-password` - Solicitar recuperación
- `POST /api/sessions/reset-password/:token` - Restablecer contraseña

### API - Productos (Admin)
- `GET /api/products` - Listar productos (público)
- `GET /api/products/:pid` - Ver producto (público)
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:pid` - Actualizar producto (admin)
- `DELETE /api/products/:pid` - Eliminar producto (admin)

### API - Carritos (Usuario)
- `GET /api/carts/:cid` - Ver carrito
- `POST /api/carts/:cid/product/:pid` - Agregar producto
- `PUT /api/carts/:cid/product/:pid` - Actualizar cantidad
- `DELETE /api/carts/:cid/product/:pid` - Eliminar producto
- `DELETE /api/carts/:cid` - Vaciar carrito
- `POST /api/carts/:cid/purchase` - Finalizar compra

## Ejemplos de Uso

### 1. Crear un producto (Admin)

```bash
# Primero, hacer login como admin
POST http://localhost:8080/api/sessions/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

# Obtendrás un token JWT en las cookies

# Crear producto
POST http://localhost:8080/api/products
Cookie: token=<tu_jwt_token>
Content-Type: application/json

{
  "title": "Producto Nuevo",
  "description": "Descripción del producto",
  "price": 100,
  "stock": 50,
  "category": "Categoría",
  "code": "PROD-001"
}
```

### 2. Agregar producto al carrito (Usuario)

```bash
# Login como usuario
POST http://localhost:8080/api/sessions/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user123"
}

# Agregar producto al carrito (usa el cart_id del usuario)
POST http://localhost:8080/api/carts/{cart_id}/product/{product_id}
Cookie: token=<tu_jwt_token>
Content-Type: application/json

{
  "quantity": 2
}
```

### 3. Finalizar compra

```bash
POST http://localhost:8080/api/carts/{cart_id}/purchase
Cookie: token=<tu_jwt_token>
```

### 4. Recuperar contraseña

```bash
# Solicitar recuperación
POST http://localhost:8080/api/sessions/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

# Recibirás un email con un link
# Usar el token del link para restablecer:
POST http://localhost:8080/api/sessions/reset-password/{token}
Content-Type: application/json

{
  "newPassword": "nueva_password_123"
}
```

## Testing con Postman/Thunder Client

Importa esta colección básica:

```json
{
  "name": "Backend Ecommerce",
  "requests": [
    {
      "name": "Login Admin",
      "method": "POST",
      "url": "http://localhost:8080/api/sessions/login",
      "body": {
        "email": "admin@example.com",
        "password": "admin123"
      }
    },
    {
      "name": "Get Products",
      "method": "GET",
      "url": "http://localhost:8080/api/products"
    }
  ]
}
```

## Solución de Problemas

### Error: No se puede conectar a MongoDB
- Verifica que MongoDB esté corriendo
- Revisa la URI en el archivo `.env`

### Error: No se envían emails
- Verifica las credenciales de Gmail
- Asegúrate de usar una "Contraseña de aplicación"
- Verifica que EMAIL_USER y EMAIL_PASS estén correctos

### Error: Token inválido
- El JWT expira en 2 horas, vuelve a hacer login
- Los tokens de recuperación expiran en 1 hora

### Error: No tienes permisos
- Verifica que estés usando el usuario correcto (admin para productos, user para carritos)
- Revisa que el token JWT esté en las cookies

## Estructura del Proyecto

```
src/
├── dao/                    # Acceso a datos
├── dto/                    # Transferencia de datos
├── models/                 # Modelos Mongoose
├── repositories/           # Lógica de negocio
├── routes/                 # Rutas API
├── middleware/             # Middleware de autorización
├── config/                 # Configuración
├── utils/                  # Utilidades
└── views/                  # Vistas Handlebars
```

## Características Implementadas

✅ Patrón Repository con DAOs  
✅ DTOs para no exponer información sensible  
✅ Sistema de recuperación de contraseña por email  
✅ Middleware de autorización por roles  
✅ Gestión de productos (solo admin)  
✅ Gestión de carritos (solo usuarios)  
✅ Sistema de compras con tickets  
✅ Verificación de stock  
✅ Compras parciales  
✅ Envío de emails de confirmación  
✅ Tokens que expiran  
✅ Validación de contraseña anterior  

## Notas Importantes

- Las contraseñas se hashean con bcrypt
- Los JWT expiran en 2 horas
- Los tokens de recuperación expiran en 1 hora
- El stock se actualiza automáticamente al comprar
- Si un producto no tiene stock suficiente, se realiza compra parcial
- Cada compra genera un ticket único con código UUID
