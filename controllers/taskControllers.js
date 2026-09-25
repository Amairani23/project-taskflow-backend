import Task from "../models/task.js"
import Project from "../models/project.js"

const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404

const createTask = async (req, res, next) => {
  try {
    const { title, status, prioridad, assignedTo } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    const isOwner = project.ownerId.equals(req.user._id)

    const isAssignedToProject = project.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    )

    // Solo el dueño o un colaborador asignado al proyecto puede crear tareas
    if (!isOwner && !isAssignedToProject) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot create this task.",
      })
    }

    // Un colaborador NO puede asignar la tarea
    if (!isOwner && assignedTo) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "Only the project owner can assign a task.",
      })
    }

    // Si el owner asigna la tarea, debe ser a alguien del proyecto
    if (isOwner && assignedTo) {
      const userIsInProject = project.assignedTo.some(
        (userId) => userId.toString() === assignedTo.toString(),
      )

      if (!userIsInProject) {
        return res.status(ERROR_FORBIDDEN).send({
          message: "This user is not assigned to this project.",
        })
      }
    }

    const newTask = new Task({
      title,
      status,
      prioridad,
      assignedTo: isOwner ? assignedTo : undefined,
      idProject: projectId,
    })

    await newTask.save()

    return res.status(201).send(newTask)
  } catch (error) {
    return next(error)
  }
}

const showTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({})

    const isAdmin = req.user.systemRol === "admin"

    if (!isAdmin) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot view the tasks of this project.",
      })
    }

    return res.status(200).json(tasks)
  } catch (error) {
    return next(error)
  }
}

const showTask = async (req, res, next) => {
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

    return res.status(200).json(tasks)
  } catch (error) {
    return next(error)
  }
}

const deleteTaks = async (req, res, next) => {
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
    const isAssigned = task.assignedTo.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(ERROR_FORBIDDEN).send({
        message: "You cannot delete this task.",
      })
    }

    await task.deleteOne()

    await Task.findById(taskId)

    return res.status(200).json({
      message: "Task deleted successfully",
      taskId,
    })
  } catch (error) {
    return next(error)
  }
}

const actTaks = async (req, res, next) => {
  try {
    const { taskId, projectId } = req.params
    const { title, status, prioridad, assignedTo } = req.body

    // Buscar Tarea de forma directa (Sin orFail con throw oculto)
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).send({ message: "Task not found" })
    }

    // Buscar Proyecto de forma directa
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).send({ message: "Project not found" })
    }

    // Validar pertenencia de la tarea al proyecto
    const taskProjectId = task.idProject ? task.idProject.toString() : ""
    if (taskProjectId !== project._id.toString()) {
      return res.status(403).send({
        message: "This task does not belong to this project.",
      })
    }

    // Validaciones de Seguridad (Roles)
    const isAdmin = req.user.systemRol === "admin"
    const projectOwnerId = project.ownerId._id || project.ownerId

    const isOwner = projectOwnerId.toString() === req.user._id.toString()

    const taskAssignees = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo]
    const isAssigned = taskAssignees.some(
      (id) => id.toString() === req.user._id.toString(),
    )

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).send({
        message: "You cannot update this task.",
      })
    }

    // Actualización de campos básicos
    if (title !== undefined) task.title = title
    if (status !== undefined) task.status = status
    if (prioridad !== undefined) task.prioridad = prioridad

    // Solo admin o propietario pueden cambiar assignedTo
    if (assignedTo !== undefined && (isAdmin || isOwner)) {
      if (!assignedTo || assignedTo === "" || assignedTo === "null") {
        task.assignedTo = null
      } else {
        const frontendUserIdStr = assignedTo.toString().trim()

        const isAssignedToProject = project.assignedTo.some((projectUser) => {
          const projectUserId =
            projectUser._id.toString() || projectUser.toString()

          return projectUserId === frontendUserIdStr
        })

        if (!isAssignedToProject) {
          return res.status(403).send({
            message: "This user is not assigned to this project.",
          })
        }

        task.assignedTo = frontendUserIdStr
      }
    }

    // Guardar en Base de Datos
    await task.save()

    // Devolvemos la tarea actualizada con un estado de éxito
    return res.status(200).json(task.toObject())
  } catch (error) {
    return next(error)
  }
}

export { createTask, showTasks, showTask, deleteTaks, actTaks }
