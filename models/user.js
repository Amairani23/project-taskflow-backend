import mongoose from "mongoose"
import validator from "validator"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "Amairani",
  },

  systemRol: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "colaborador",
  },

  avatar: {
    type: String,
    default:
      "https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg",
    validate: {
      validator: (url) =>
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(
          url,
        ),
      message: "URL inválida",
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Correo electrónico inválido",
    },
  },

  password: {
    type: String,
    required: true,
    select: false,
  },
})

const User = mongoose.model("User", userSchema)
export default User
