import Task from "../models/task.js"
import Project from "../models/project.js"
import User from "../models/user.js"

const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404

export const createTask = async (req, res, next) => {
  try {
    const { title, assignedTo } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    if (!project.ownerId.equals(req.user._id)) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot create this task.",
      })
    }

    if (assignedTo) {
      const isAssignedToProject = project.assignedTo.some(
        (userId) => userId.toString() === assignedTo.toString(),
      )

      if (!isAssignedToProject) {
        return res.status(ERROR_FORBIDDEN).send({
          message: "This user is not assigned to this project.",
        })
      }
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

export const showTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    const isAdmin = req.user.systemRol === "admin"

    const isOwner = project.ownerId.equals(req.user._id)

    const isAssigned = project.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    )

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot view the tasks of this project.",
      })
    }

    const tasks = await Task.find({
      idProject: projectId,
    }).populate("assignedTo", "name")

    res.status(200).json(tasks)
  } catch (error) {
    next(error)
  }
}

export const deleteTaks = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params

    const task = await Task.findById(taskId)
      .populate("idProject")
      .orFail(() => {
        const error = new Error("Task not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })

    if (task.idProject._id.toString() !== projectId.toString()) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "This task does not belong to this project.",
      })
    }

    const isAdmin = req.user.systemRol === "admin"
    const isOwner =
      task.idProject.ownerId.toString() === req.user._id.toString()
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner && !isAssigned) {
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
    const { title, status, prioridad, assignedTo } = req.body

    const task = await Task.findById(taskId)
      .populate("idProject")
      .orFail(() => {
        const error = new Error("Task not found")
        error.statusCode = ERROR_NOT_FOUND
        throw error
      })

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    if (task.idProject._id.toString() !== project._id.toString()) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "This task does not belong to this project.",
      })
    }

    const isAdmin = req.user.systemRol === "admin"

    const isOwner = project.ownerId.toString() === req.user._id.toString()

    const isAssigned = task.assignedTo?.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot update this task.",
      })
    }

    if (title !== undefined) {
      task.title = title
    }

    if (status !== undefined) {
      task.status = status
    }

    if (prioridad !== undefined) {
      task.prioridad = prioridad
    }

    if (assignedTo !== undefined) {
      if (!isAdmin && !isOwner) {
        return res.status(ERROR_FORBIDDEN).send({
          message: "You cannot change the assignee.",
        })
      }

      const isAssignedToProject = project.assignedTo.some(
        (userId) => userId.toString() === assignedTo.toString(),
      )

      if (!isAssignedToProject) {
        return res.status(ERROR_FORBIDDEN).send({
          message: "This user is not assigned to this project.",
        })
      }

      task.assignedTo = assignedTo
    }

    await task.save()

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}
