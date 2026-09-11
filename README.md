# API de Gestión de Proyectos y Tareas

Backend REST API para la gestión de proyectos y tareas, desarrollado con Node.js, Express y MongoDB/Mongoose.

La aplicación permite crear y administrar proyectos y tareas, asignar usuarios a proyectos y posteriormente asignar tareas a los usuarios que pertenecen al proyecto.

El sistema cuenta con autenticación mediante JWT y autorización basada en roles y relaciones entre usuarios, proyectos y tareas.

## Tecnologías

Node.js
Express
MongoDB
Mongoose
JSON Web Token (JWT)
Celebrate / Joi
JavaScript ES Modules

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

###### Ejemplo:

`{
  "titleProject": "Sistema de tareas",
  "descriptionProject": "Aplicación para administrar tareas",
  "ownerId": "64f123456789012345678901",
  "assignedTo": [
    "64f123456789012345678902",
    "64f123456789012345678903"
  ]
}`

###### Task

`{
title: String,
assignedTo: ObjectId,
idProject: ObjectId,
status: String,
prioridad: String,
createdAt: Date
}

#####Relaciones:

idProject
↓
Project

assignedTo
↓
User

Ejemplo:
`{
  "title": "Crear login",
  "assignedTo": "64f123456789012345678902",
  "idProject": "64f123456789012345678904",
  "status": "pending",
  "prioridad": "alta"
}`

### Autenticación

- Las rutas protegidas requieren un token JWT.
- El middleware auth verifica el token y obtiene el usuario autenticado.
- El JWT identifica al usuario mediante su \_id.
- El rol y los datos del usuario pueden obtenerse desde MongoDB para mantener actualizados los permisos.

### Endpoints

Proyectos
Crear proyecto
POST /projects

Body:

{
"titleProject": "Mi proyecto",
"descriptionProject": "Descripción del proyecto"
}

Un administrador también puede asignar usuarios:

{
"titleProject": "Proyecto de desarrollo",
"descriptionProject": "Proyecto para desarrollar una aplicación",
"assignedTo": [
"64f123456789012345678901",
"64f123456789012345678902"
]
}

Un usuario normal no puede asignar usuarios al crear el proyecto.

Obtener proyectos
GET /projects

El administrador puede visualizar los proyectos según las reglas de autorización.

Los usuarios pueden visualizar:

Sus propios proyectos.
Los proyectos donde están asignados.

Los proyectos pueden incluir información del propietario y usuarios asignados mediante populate():

.populate("ownerId", "name")
.populate("assignedTo", "name")

Actualizar proyecto
PATCH /projects/:projectId

Body:

{
"titleProject": "Nuevo título",
"descriptionProject": "Nueva descripción"
}

Un administrador puede modificar también los usuarios asignados:

{
"titleProject": "Proyecto actualizado",
"assignedTo": [
"64f123456789012345678901",
"64f123456789012345678902"
]
}

Los usuarios normales no pueden modificar assignedTo.

Eliminar proyecto
DELETE /projects/:projectId

Puede eliminar:

El administrador.
El propietario del proyecto.

Un usuario asignado no puede eliminar el proyecto.

Tareas

Las tareas se gestionan utilizando el projectId para garantizar que pertenecen al proyecto correcto.

Crear tarea
POST /projects/:projectId/tasks

Body:

{
"title": "Crear página de login"
}

También puede asignarse a uno de los usuarios del proyecto:

{
"title": "Crear página de login",
"assignedTo": "64f123456789012345678901"
}

Antes de guardar la tarea, el backend comprueba que el usuario asignado pertenezca al proyecto.

Por ejemplo:

Proyecto
├── Juan
├── Pedro
└── María

Tarea
└── Juan ✅

Pero:

Proyecto
├── Juan
└── Pedro

Tarea
└── María ❌

La segunda operación debe ser rechazada.

Obtener tareas de un proyecto
GET /projects/:projectId/tasks

El backend comprueba que el usuario tenga acceso al proyecto.

Las tareas pueden devolver también el nombre del usuario asignado:

.populate("assignedTo", "name")

Actualizar tarea
PATCH /projects/:projectId/tasks/:taskId

Body:

{
"title": "Nuevo título",
"status": "completed",
"prioridad": "media"
}

También puede modificarse el usuario asignado cuando el usuario tiene permiso:

{
"assignedTo": "64f123456789012345678901"
}

El backend vuelve a comprobar que el usuario pertenezca al proyecto.

Eliminar tarea
DELETE /projects/:projectId/tasks/:taskId

Puede eliminar:

Admin.
Propietario del proyecto.

El usuario asignado a la tarea no puede eliminarla.

Validación

Las rutas utilizan celebrate y Joi para validar los datos recibidos.

Ejemplo:

Joi.object().keys({
title: Joi.string().min(2).required(),
assignedTo: Joi.string().hex().length(24).optional(),
})

Para arrays de usuarios:

assignedTo: Joi.array().items(
Joi.string().hex().length(24)
)

La validación de Joi comprueba el formato de los datos.

La existencia de los usuarios se comprueba posteriormente mediante MongoDB.

Relaciones entre entidades

La estructura principal es:

                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
              ownerId           assignedTo[]
                 │                   │
                 ▼                   ▼
             ┌──────────────────────────┐
             │         Project          │
             └────────────┬─────────────┘
                          │
                       idProject
                          │
                          ▼
                    ┌───────────┐
                    │   Task    │
                    └─────┬─────┘
                          │
                     assignedTo
                          │
                          ▼
                       User

Seguridad y autorización

La autorización se realiza siempre en el backend.

No se debe confiar en permisos enviados desde el frontend.

Por ejemplo, el backend determina si un usuario es administrador:

const isAdmin = req.user.systemRol === "admin"

También comprueba si es propietario:

const isOwner =
project.ownerId.toString() === req.user.\_id.toString()

Y si está asignado:

const isAssigned = project.assignedTo.some(
(userId) => userId.toString() === req.user.\_id.toString()
)

Las operaciones sensibles deben comprobar estas condiciones antes de modificar o eliminar información.

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

Variables de entorno

Crear un archivo .env:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/project-api
JWT_SECRET=tu_clave_secreta

No subir el archivo .env al repositorio.

Agregarlo a .gitignore:

.env
node_modules/

Instalación

Clonar el proyecto:

git clone <URL_DEL_REPOSITORIO>

Entrar en la carpeta:

cd nombre-del-proyecto

Instalar dependencias:

npm install

Configurar las variables de entorno:

PORT=3000
MONGODB_URI=...
JWT_SECRET=...

Iniciar el servidor:

npm start

Para desarrollo, si el proyecto utiliza Nodemon:

npm run dev

Estructura del proyecto

Una posible estructura:

`src/
│
├── controllers/
│ ├── projectController.js
│ └── taskController.js
│
├── middlewares/
│ └── auth.js
│
├── models/
│ ├── user.js
│ ├── project.js
│ └── task.js
│
├── routes/
│ ├── projectRoutes.js
│ └── taskRoutes.js
│
├── app.js
└── index.js```

Flujo de creación de una tarea

El flujo principal es:

1. Usuario autenticado
   ↓
2. POST /projects/:projectId/tasks
   ↓
3. Buscar proyecto
   ↓
4. Comprobar permisos
   ↓
5. Comprobar usuario asignado
   ↓
6. Verificar que pertenece al proyecto
   ↓
7. Crear tarea
   ↓
8. Guardar en MongoDB
   ↓
9. Responder con la tarea

Ejemplo completo

Proyecto:

{
"titleProject": "Aplicación web",
"descriptionProject": "Desarrollo de una aplicación web",
"ownerId": "ADMIN_ID",
"assignedTo": [
"USER_1_ID",
"USER_2_ID"
]
}

Tarea:

{
"title": "Crear formulario de login",
"assignedTo": "USER_1_ID",
"idProject": "PROJECT_ID",
"status": "pending",
"prioridad": "alta"
}

El backend comprueba:

USER_1_ID ∈ Project.assignedTo

Si pertenece:

✅ Tarea creada

Si no pertenece:

❌ 403 Forbidden

## Objetivo del proyecto

El objetivo es implementar una API REST segura para administrar proyectos y tareas utilizando autenticación, autorización basada en roles y relaciones entre recursos.

El proyecto busca aplicar conceptos de backend como:

APIs REST.
Autenticación JWT.
Autorización.
Roles.
Relaciones entre documentos MongoDB.
Mongoose populate.
Validación de datos.
Middleware.
Manejo centralizado de errores.
Control de acceso a recursos.
