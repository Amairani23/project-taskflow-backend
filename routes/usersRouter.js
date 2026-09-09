import express from "express"
import { celebrate, Joi, Segments } from "celebrate"
import validator from "validator"

import {
  getUser,
  getUserId,
  patchUser,
  patchUserAvatar,
  createUser,
  getCurrentUser,
} from "../controllers/usersControllers.js"

const router = express.Router()

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value
  }

  return helpers.error("string.uri")
}

// Crear usuario
router.post(
  "/users",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      systemRol: Joi.string().min(2).max(30),
      avatar: Joi.string().custom(validateURL),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
)

//Mostrar usuarios
router.get("/users", getUser)

//Mostrar usuarios
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
      name: Joi.string().min(2).max(30),
      systemRol: Joi.string().min(2).max(30),
    }),
  }),
  patchUser,
)

// Actualizar avatar
router.patch(
  "/users/me/avatar",
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().custom(validateURL).required(),
    }),
  }),
  patchUserAvatar,
)

export default router
