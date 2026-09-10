import express from "express"
import { celebrate, Joi } from "celebrate"

import {
  actTaks,
  actTaksAssigned,
  createTask,
  deleteTaks,
  showTaks,
} from "../controllers/taskControllers.js"

const router = express.Router()

// Crear proyecto
router.post(
  "/projects/:projectId/tasks",
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().min(2).required(),
      assignedTo: Joi.string().hex().length(24).optional(),
    }),
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  createTask,
)

// Muestra tareas
router.get(
  "/tasks",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  showTaks,
)

// Elimina proyecto
router.delete(
  "/tasks/:tasksId",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteTaks,
)

// Actualizar proyecto
router.patch(
  "/tasks/:tasksId",
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().min(2),
      status: Joi.string().min(2),
      prioridad: Joi.string().min(2),
    }),
  }),
  actTaks,
)

// Actualizar proyecto
router.patch(
  "/tasks/:tasksId/assigned",
  celebrate({
    body: Joi.object().keys({
      assignade: Joi.string().min(2),
    }),
  }),
  actTaksAssigned,
)
export default router
