import express from "express"
import { celebrate, Joi } from "celebrate"

import {
  actTaks,
  createTask,
  deleteTaks,
  showTasks,
  showTask,
} from "../controllers/taskControllers.js"

const router = express.Router()

// Crear tarea
router.post(
  "/projects/:projectId/tasks",
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().min(2).required(),
      status: Joi.string().valid("pending", "progress", "completed").required(),
      prioridad: Joi.string().valid("alta", "media", "baja").required(),
      assignedTo: Joi.string().hex().length(24).optional(),
    }),
  }),
  createTask,
)

// Muestra tareas
router.get("/tasks", showTasks)

// Muestra tareas
router.get(
  "/projects/:projectId/tasks",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  showTask,
)

// Elimina tarea
router.delete(
  "/projects/:projectId/tasks/:taskId",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
      taskId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteTaks,
)

// Actualizar tarea
router.patch(
  "/projects/:projectId/tasks/:taskId",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
      taskId: Joi.string().hex().length(24).required(),
    }),
    body: Joi.object().keys({
      title: Joi.string().min(2),
      status: Joi.string().min(2),
      prioridad: Joi.string().min(2),
      assignedTo: Joi.string().hex().length(24).optional(),
    }),
  }),
  actTaks,
)

export default router
