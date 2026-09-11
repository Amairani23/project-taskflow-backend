import express from "express"
import mongoose from "mongoose"
//import cors from "cors"

import { login, createUser } from "./controllers/usersControllers.js"
import { errorHandler } from "./middlewares/error-handler.js"
import { auth } from "./middlewares/auth.js"
import { requestLogger, errorLogger } from "./middlewares/logger.js"
import usersRouter from "./routes/usersRouter.js"
import projectRouter from "./routes/projectRouter.js"
import taskRouter from "./routes/taskRouter.js"

import "dotenv/config"

const app = express()
const { PORT = 3000 } = process.env

app.use(express.json())

// Conectar con MongoDB
mongoose
  .connect("mongodb://localhost:27017/taskflow")
  .then(() => {
    console.log("Conectado a MongoDB")
  })
  .catch((error) => {
    console.error("Error al conectar al servidor", error)
    process.exit(1)
  })

app.use(requestLogger)

// app.get('/crash-test', () => {
//   setTimeout(() => {
//     throw new Error('El servidor va a caer');
//   }, 0);
// });

app.post("/signin", login)
app.post("/signup", createUser)

app.use(auth)

app.use("/", usersRouter)
app.use("/", projectRouter)
app.use("/", taskRouter)

app.use(errorLogger)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})
