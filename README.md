# API de Gestión de Proyectos y Tareas

Backend REST API para la gestión de proyectos y tareas, desarrollado con Node.js, Express y MongoDB/Mongoose.

La aplicación permite crear y administrar proyectos y tareas, asignar usuarios a proyectos y posteriormente asignar tareas a los usuarios que pertenecen al proyecto.

El sistema cuenta con autenticación mediante JWT y autorización basada en roles y relaciones entre usuarios, proyectos y tareas.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Celebrate / Joi
- JavaScript ES Modules

## Funcionalidades

### Usuarios y autenticación

- Autenticación mediante JWT.
- Identificación del usuario autenticado mediante req.user.
- Roles de usuario:
- admin
- user
- Protección de rutas mediante middleware de autenticación.

### Proyectos

Los usuarios autenticados pueden crear proyectos.

Cada proyecto contiene:

- Título
- Descripción
- Propietario (ownerId)
- Usuarios asignados (assignedTo)
- Fecha de creación

Los administradores pueden asignar usuarios a los proyectos.

Un proyecto puede tener varios usuarios asignados.

### Tareas

Las tareas pertenecen a un proyecto mediante idProject.

Cada tarea puede tener:

- Título
- Usuario asignado
- Proyecto al que pertenece
- Estado
- Prioridad
- Fecha de creación

Una tarea solo puede ser asignada a un usuario que pertenezca a los usuarios asignados al proyecto.

### Roles y permisos

#### Proyectos

##### Admin

El administrador puede:

- Crear proyectos.
- Ver cualquier proyecto.
- Editar cualquier proyecto.
- Eliminar cualquier proyecto.
- Asignar usuarios a proyectos.

##### Owner/Propietario

El propietario es el usuario que creó el proyecto.
Puede:

- Ver su proyecto.
- Editar su proyecto.
- Eliminar su proyecto.
- Gestionar las tareas del proyecto.
- Usuario asignado

##### Un usuario asignado a un proyecto puede:

- Ver el proyecto.
- Editar el proyecto.
- Trabajar con las tareas permitidas.

No puede:

- Eliminar el proyecto.
- Asignar otros usuarios al proyecto.

#### Tareas

La tarea pertenece siempre a un proyecto.

Además, si una tarea tiene un usuario asignado, este usuario debe pertenecer previamente al proyecto.

#### Resumen

##### Proyectos

| Acción           | Admin | Propietario | Asignado al proyecto |
| ---------------- | ----- | ----------- | -------------------- |
| Crear            | ✅    | ✅          | —                    |
| Ver              | ✅    | ✅          | ✅                   |
| Editar           | ✅    | ✅          | ✅                   |
| Eliminar         | ✅    | ✅          | ❌                   |
| Asignar usuarios | ✅    | ❌          | ❌                   |

##### Tareas

| Acción           | Admin | Propietario | Asignado a tarea |
| ---------------- | ----- | ----------- | ---------------- |
| Crear            | ✅    | ✅          | ❌               |
| Ver              | ✅    | ✅          | ✅               |
| Editar           | ✅    | ✅          | ✅               |
| Eliminar         | ✅    | ✅          | ❌               |
| Cambiar asignado | ✅    | ✅          | ❌               |

### Estructura de datos

###### User

El usuario contiene información como:

`{
  _id,
  name,
  email,
  password,
  systemRol
}`

El campo systemRol determina si el usuario es:

admin o user

###### Project

`{
  titleProject: String,
  descriptionProject: String,
  ownerId: ObjectId,
  assignedTo: [ObjectId],
  createdAt: Date
}`

##### Relaciones:

ownerId
↓
User

assignedTo[]
↓
User`

###### Task

`{
title: String,
assignedTo: ObjectId,
idProject: ObjectId,
status: String,
prioridad: String,
createdAt: Date
}`

##### Relaciones:

idProject
↓
Project

assignedTo
↓
User

### Autenticación

- Las rutas protegidas requieren un token JWT.
- El middleware auth verifica el token y obtiene el usuario autenticado.
- El JWT identifica al usuario mediante su \_id.
- El rol y los datos del usuario pueden obtenerse desde MongoDB para mantener actualizados los permisos.

### Endpoints

##### Proyectos

Crear proyecto
POST /projects

Obtener proyectos
GET /projects

Actualizar proyecto
PATCH /projects/:projectId

Eliminar proyecto
DELETE /projects/:projectId

##### Tareas

Crear tarea
POST /projects/:projectId/tasks

Obtener tareas de un proyecto
GET /projects/:projectId/tasks

Actualizar tarea
PATCH /projects/:projectId/tasks/:taskId

Eliminar tarea
DELETE /projects/:projectId/tasks/:taskId

### Validación

Las rutas utilizan celebrate y Joi para validar los datos recibidos.

La validación de Joi comprueba el formato de los datos.

La existencia de los usuarios se comprueba posteriormente mediante MongoDB.

### Seguridad y autorización

- La autorización se realiza siempre en el backend.
- No se debe confiar en permisos enviados desde el frontend.
- Por ejemplo, el backend determina si un usuario es administrador.
- También comprueba si es propietario o si está asignado.
- Las operaciones sensibles deben comprobar estas condiciones antes de modificar o eliminar información.

### Manejo de errores

La API utiliza códigos HTTP para indicar el resultado de las operaciones.

- 200 OK

Operación realizada correctamente.

- 201 Created

Recurso creado correctamente.

- 400 Bad Request

Datos enviados incorrectamente.

- 401 Unauthorized

El usuario no está autenticado o el token no es válido.

- 403 Forbidden

El usuario está autenticado pero no tiene permisos para realizar la operación.

- 404 Not Found

El recurso solicitado no existe.

### Variables de entorno

Crear un archivo .env:

- JWT_SECRET=tu_clave_secreta

Agregarlo a .gitignore:
.env
node_modules/

### Instalación

Clonar el proyecto:

git clone <URL_DEL_REPOSITORIO>

Entrar en la carpeta:

cd nombre-del-proyecto

Instalar dependencias:

npm install

Configurar las variables de entorno:
JWT_SECRET=...

Iniciar el servidor:

npm start

Para desarrollo, si el proyecto utiliza Nodemon:

npm run start

## Objetivo del proyecto

El objetivo es implementar una API REST segura para administrar proyectos y tareas utilizando autenticación, autorización basada en roles y relaciones entre recursos.

El proyecto busca aplicar conceptos de backend como:

- APIs REST.
- Autenticación JWT.
- Autorización.
- Roles.
- Relaciones entre documentos MongoDB.
- Mongoose populate.
- Validación de datos.
- Middleware.
- Manejo centralizado de errores.
- Control de acceso a recursos.
