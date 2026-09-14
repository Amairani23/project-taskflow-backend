import express from "express"
import { celebrate, Joi } from "celebrate"

import {
  actProject,
  createProject,
  deleteProject,
  showProject,
  showProjects,
} from "../controllers/projectController.js"

const router = express.Router()

// Crear proyecto
router.post(
  "/projects",
  celebrate({
    body: Joi.object().keys({
      titleProject: Joi.string().min(2).max(30).required(),
      descriptionProject: Joi.string().required(),
      assignedTo: Joi.array().items(Joi.string().hex().length(24)),
    }),
  }),
  createProject,
)

// Muestra proyectos
router.get("/projects", showProjects)

// Muestra proyecto
router.get("/projects/:projectId", showProject)

// Elimina proyecto
router.delete(
  "/projects/:projectId",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteProject,
)

// Actualizar proyecto
router.patch(
  "/projects/:projectId",
  celebrate({
    body: Joi.object().keys({
      titleProject: Joi.string().min(2),
      descriptionProject: Joi.string().min(2),
      assignedTo: Joi.array().items(Joi.string().hex().length(24)),
    }),
  }),
  actProject,
)
export default router
