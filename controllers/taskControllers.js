import Task from "../models/task.js"
import Project from "../models/project.js"
import User from "../models/user.js"

const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404

export const createTask = async (req, res, next) => {
  try {
    const { title, assignedTo } = req.body
    const { projectId } = req.params

    await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    if (assignedTo) {
      await User.findById(assignedTo).orFail(() => {
        const error = new Error("User not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })
    }

    const newTask = new Task({
      title,
      assignedTo,
      idProject: projectId,
    })

    await newTask.save()

    res.status(201).send(newTask)
  } catch (error) {
    next(error)
  }
}

export const showTaks = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const task = await Task.find({})

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    if (project._id !== task.idProject) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "Only the project owner can create tasks.",
      })
    }

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

export const deleteTaks = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params

    //primero buscar la tarjeta, comparar el owner con el usuario autenticado
    const task = await Task.findById(taskId)
      .populate("idProject")
      .orFail(() => {
        const error = new Error("Task not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })

    // Comprobar que la tarea pertenece al proyecto indicado
    if (task.idProject._id.toString() !== projectId.toString()) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "This task does not belong to this project.",
      })
    }

    // Puede borrar si es el asignado O el dueño del proyecto
    if (
      req.user.systemRol !== "admin" &&
      task.assignade?.toString() !== req.user._id.toString() &&
      task.idProject.ownerId.toString() !== req.user._id.toString()
    ) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot delete this task.",
      })
    }

    await task.deleteOne()

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

export const actTaks = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params
    const { title, status, prioridad } = req.body

    const task = await Task.findById(taskId)
      .populate("idProject")
      .orFail(() => {
        const error = new Error("Task not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })

    // Comprobar que la tarea pertenece al proyecto indicado
    if (task.idProject._id.toString() !== projectId.toString()) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "This task does not belong to this project.",
      })
    }

    const isAdmin = req.user.systemRol === "admin"
    const isOwner =
      task.idProject.ownerId.toString() === req.user._id.toString()
    const isAssigned = task.assignade?.toString() === req.user._id.toString()

    // Solo admin, dueño o asignado pueden actualizar la tarea
    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot update this task.",
      })
    }

    // Solo actualizar los campos que vienen en el body
    if (title !== undefined) {
      task.title = title
    }

    if (status !== undefined) {
      task.status = status
    }

    if (prioridad !== undefined) {
      task.prioridad = prioridad
    }

    await task.save()

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

export const actTaksAssigned = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params
    const { assignade } = req.body

    const task = await Task.findById(taskId)
      .populate("idProject")
      .orFail(() => {
        const error = new Error("Task not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })

    // Comprobar que la tarea pertenece al proyecto indicado
    if (task.idProject._id.toString() !== projectId.toString()) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "This task does not belong to this project.",
      })
    }

    const isAdmin = req.user.systemRol === "admin"
    const isOwner =
      task.idProject.ownerId.toString() === req.user._id.toString()

    // Solo admin o dueño pueden cambiar el asignado
    if (!isAdmin && !isOwner) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot change the assignee of this task.",
      })
    }

    const user = await User.findById(assignade).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    task.assignade = assignade

    await task.save()

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}
