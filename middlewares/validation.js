import { celebrate, Joi } from "celebrate"
import validator from "validator"

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value
  }

  return helpers.error("string.uri")
}

const validarUsuario = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    systemRol: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateURL),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
})

export default validarUsuario
