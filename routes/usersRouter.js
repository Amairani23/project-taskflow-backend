import express from "express"
import { celebrate, Joi } from "celebrate"
import validator from "validator"

import {
  getUser,
  getUserId,
  updateUser,
  createUser,
  getCurrentUser,
  updateRolDos,
  deleteUserId,
} from "../controllers/usersControllers.js"
import validarUsuario from "../middlewares/validation.js"

const router = express.Router()

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value
  }

  return helpers.error("string.uri")
}

// Crear usuario
router.post("/users", validarUsuario, createUser)

// Mostrar usuarios
router.get("/users", getUser)

// Mostrar usuario
router.get("/users/me", getCurrentUser)

// Mostrar usuario por ID
router.get(
  "/users/:userId",
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24).required(),
    }),
  }),
  getUserId,
)

// Actualizar perfil
router.patch(
  "/users/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      avatar: Joi.string().custom(validateURL),
    }),
  }),
  updateUser,
)

// Actualizar rol
router.patch(
  "/users/:userId",
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24).required(),
    }),
  }),
  updateRolDos,
)

router.delete(
  "/users/:userId",
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteUserId,
)

export default router
