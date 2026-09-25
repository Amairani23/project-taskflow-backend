import express from "express"
import mongoose from "mongoose"
import cors from "cors"

import { createUser, login } from "./controllers/usersControllers.js"
import errorHandler from "./middlewares/error-handler.js"
import auth from "./middlewares/auth.js"
import { requestLogger, errorLogger } from "./middlewares/logger.js"
import routes from "./routes/index.js"
import validarUsuario from "./middlewares/validation.js"

import "dotenv/config"

const app = express()
const { PORT = 3000 } = process.env

app.use(express.json())

// Conectar con MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB")
  })
  .catch((error) => {
    console.error("Error al conectar al servidor", error)
    process.exit(1)
  })

app.use(requestLogger)

app.use(cors())

app.post("/signin", login)
app.post("/signup", validarUsuario, createUser)

app.use(auth)

app.use("/", routes)

app.use(errorLogger)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})
