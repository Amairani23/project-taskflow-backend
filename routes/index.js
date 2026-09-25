import express from "express"

import usersRouter from "./usersRouter.js"
import projectRouter from "./projectRouter.js"
import taskRouter from "./taskRouter.js"

const router = express.Router()

router.use("/", usersRouter)
router.use("/", projectRouter)
router.use("/", taskRouter)

export default router
