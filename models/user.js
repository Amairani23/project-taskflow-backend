import mongoose from "mongoose"
import validator from "validator"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: "New User",
  },

  systemRol: {
    type: String,
    enum: ["colaborador", "admin"],
    default: "colaborador",
    required: true,
  },

  avatar: {
    type: String,
    default:
      "https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg",
    validate: {
      validator: (url) =>
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9\-._~:/?#\x5B\x5D@!$&'()*+,;=%]+$/.test(
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
  },
})

const User = mongoose.model("User", userSchema)
export default User
