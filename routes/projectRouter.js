import express from "express"
import { celebrate, Joi } from "celebrate"

import {
  actProject,
  createProject,
  deleteProject,
  showProject,
} from "../controllers/projectController.js"

const router = express.Router()

// Crear proyecto
router.post(
  "/projects",
  celebrate({
    body: Joi.object().keys({
      titleProject: Joi.string().min(2).max(30).required(),
      descriptionProject: Joi.string().required(),
    }),
  }),
  createProject,
)

// Muestra tarjetas
router.get("/projects", showProject)

// Elimina tarjeta
router.delete(
  "/projects/:projectId",
  celebrate({
    params: Joi.object().keys({
      projectId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteProject,
)

// Actualizar perfil
router.patch(
  "/projects/me",
  celebrate({
    body: Joi.object().keys({
      titleProject: Joi.string().min(2).max(30),
      descriptionProject: Joi.string().min(2).max(30),
    }),
  }),
  actProject,
)
export default router
