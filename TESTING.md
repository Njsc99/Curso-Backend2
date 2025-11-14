# Guía de Pruebas - Sistema de Autenticación

## Antes de empezar
1. Asegúrate de que el servidor esté corriendo: `npm start`
2. MongoDB debe estar conectado
3. Usa Postman, Insomnia o el navegador para las pruebas

## Pruebas Requeridas

### ✅ 1. Modelo de Usuario y Encriptación

#### Test: Crear un nuevo usuario
**Endpoint**: `POST http://localhost:8080/api/sessions/register`

**Body (JSON)**:
```json
{
  "first_name": "Test",
  "last_name": "Usuario",
  "email": "test@test.com",
  "age": 25,
  "password": "123456"
}
```

**Verificar**:
- [x] Usuario se crea exitosamente
- [x] Contraseña se almacena encriptada (NO como texto plano)
- [x] Se crea un carrito automáticamente
- [x] Role es 'user' por defecto

**Resultado Esperado**:
```json
{
  "status": "success",
  "message": "Usuario registrado"
}
```

**Verificar en MongoDB**:
```javascript
// La contraseña NO debe ser "123456", sino un hash como:
// "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

### ✅ 2. Sistema de Login con JWT

#### Test: Login con credenciales correctas
**Endpoint**: `POST http://localhost:8080/api/sessions/login`

**Body (JSON)**:
```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

**Verificar**:
- [x] Login exitoso
- [x] Retorna token JWT
- [x] Token se almacena en cookie
- [x] Payload del usuario está completo

**Resultado Esperado**:
```json
{
  "status": "success",
  "payload": {
    "first_name": "Test",
    "last_name": "Usuario",
    "email": "test@test.com",
    "age": 25,
    "role": "user",
    "cart": "ObjectId..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**IMPORTANTE**: Copiar el token para las siguientes pruebas.

---

### ✅ 3. Endpoint /api/sessions/current

#### Test: Obtener usuario actual con token válido
**Endpoint**: `GET http://localhost:8080/api/sessions/current`

**Headers**:
```
Authorization: Bearer <tu-token-aqui>
```

**Verificar**:
- [x] Retorna datos del usuario autenticado
- [x] Status code 200
- [x] Datos del JWT se extraen correctamente

**Resultado Esperado**:
```json
{
  "status": "success",
  "message": "Usuario autenticado correctamente",
  "payload": {
    "id": "ObjectId...",
    "email": "test@test.com",
    "first_name": "Test",
    "last_name": "Usuario",
    "role": "user"
  }
}
```

---

### ✅ 4. Validación de Token Inválido

#### Test: Acceder a /current sin token
**Endpoint**: `GET http://localhost:8080/api/sessions/current`

**Sin Headers de Authorization**

**Verificar**:
- [x] Retorna error 401
- [x] Mensaje de error apropiado

**Resultado Esperado**:
```json
{
  "error": "No auth token"
}
```

---

#### Test: Acceder a /current con token inválido
**Endpoint**: `GET http://localhost:8080/api/sessions/current`

**Headers**:
```
Authorization: Bearer token_invalido_12345
```

**Verificar**:
- [x] Retorna error 401
- [x] Passport maneja el error correctamente

**Resultado Esperado**:
```json
{
  "error": "jwt malformed"
}
```

---

### ✅ 5. Login con credenciales incorrectas

#### Test: Login con email inexistente
**Endpoint**: `POST http://localhost:8080/api/sessions/login`

**Body**:
```json
{
  "email": "noexiste@test.com",
  "password": "123456"
}
```

**Verificar**:
- [x] Redirige a /api/sessions/faillogin
- [x] No retorna token

---

#### Test: Login con contraseña incorrecta
**Endpoint**: `POST http://localhost:8080/api/sessions/login`

**Body**:
```json
{
  "email": "test@test.com",
  "password": "password_incorrecta"
}
```

**Verificar**:
- [x] Redirige a /api/sessions/faillogin
- [x] bcrypt valida correctamente

---

### ✅ 6. Pruebas desde el Navegador

#### Test: Flujo completo de registro y login
1. **Ir a**: `http://localhost:8080/register`
2. **Llenar formulario** con datos de prueba
3. **Submit**
4. **Verificar**: Usuario registrado

5. **Ir a**: `http://localhost:8080/login`
6. **Ingresar credenciales** del usuario recién creado
7. **Submit**
8. **Verificar**: Redirige a `/current`

9. **En /current**:
   - [x] Muestra información del usuario
   - [x] Token JWT está en las cookies
   - [x] Botón de logout funciona

---

### ✅ 7. Autenticación con GitHub (Opcional)

#### Test: Login con GitHub
1. **Ir a**: `http://localhost:8080/login`
2. **Click en**: "Iniciar sesión con GitHub"
3. **Autorizar** en GitHub
4. **Verificar**:
   - [x] Redirige a `/current`
   - [x] Usuario se crea automáticamente
   - [x] Se crea carrito para el usuario
   - [x] Se genera token JWT

---

### ✅ 8. Verificación en MongoDB

#### Conectar a MongoDB y verificar:

**Usuarios**:
```javascript
db.users.findOne({ email: "test@test.com" })
```

**Verificar**:
- [x] `password` es un hash (empieza con $2b$)
- [x] `cart` es un ObjectId válido
- [x] `role` es 'user'
- [x] Todos los campos requeridos están presentes

**Carritos**:
```javascript
db.carts.findOne({ _id: ObjectId("cart_id_del_usuario") })
```

**Verificar**:
- [x] Carrito existe
- [x] Array `products` está vacío inicialmente

---

## Checklist Final de Entrega

### Código
- [x] Modelo User con todos los campos
- [x] Contraseñas encriptadas con bcrypt
- [x] Estrategia Passport Local (login)
- [x] Estrategia Passport Local (register)
- [x] Estrategia Passport JWT
- [x] Endpoint /api/sessions/current implementado
- [x] Token JWT generado en login
- [x] Token almacenado en cookie httpOnly
- [x] Validación de token en rutas protegidas
- [x] Carrito creado automáticamente en registro
- [x] Manejo de errores apropiado

### Documentación
- [x] README.md completo
- [x] Explicación de endpoints
- [x] Instrucciones de instalación
- [x] Estructura del proyecto
- [x] Ejemplos de uso

### Repositorio
- [x] .gitignore configurado
- [x] node_modules excluido
- [x] Código limpio y comentado
- [x] Sin credenciales sensibles en el código

### Funcionalidad
- [x] Registro de usuarios funciona
- [x] Login funciona
- [x] JWT se genera correctamente
- [x] /api/sessions/current funciona
- [x] Logout funciona
- [x] Validación de tokens funciona
- [x] Manejo de errores funciona

---

## Comandos Útiles

### Iniciar servidor
```bash
npm start
```

### Ver logs
```bash
# Los logs aparecen en la consola del servidor
```

### Limpiar base de datos (si necesitas)
```javascript
// En MongoDB
db.users.deleteMany({})
db.carts.deleteMany({})
```

### Verificar token JWT
Ir a: https://jwt.io
Pegar el token y verificar el payload

---

## Problemas Comunes

### Error: "Cannot find module"
**Solución**: `npm install`

### Error: "User validation failed"
**Solución**: Verificar que todos los campos requeridos estén presentes

### Error: "jwt malformed"
**Solución**: Token inválido o mal formateado. Hacer login nuevamente.

### Error: "Cannot GET /api/sessions/current"
**Solución**: Verificar que el método sea GET, no POST

### No se genera el token
**Solución**: Verificar que `jsonwebtoken` esté instalado: `npm install jsonwebtoken`

---

## Resultado Final Esperado

Si todas las pruebas pasan:
✅ Sistema de autenticación completo y funcional
✅ Contraseñas seguras con bcrypt
✅ JWT implementado correctamente
✅ Endpoint /current funcionando
✅ Manejo de errores apropiado
✅ Listo para entrega

## Contacto
Si encuentras algún problema, revisa:
1. Consola del servidor para ver logs
2. MongoDB para verificar datos
3. Network tab del navegador para ver peticiones
4. Este archivo para los tests esperados
