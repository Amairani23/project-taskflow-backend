import Project from "../models/project.js"
import User from "../models/user.js"
import Task from "../models/task.js"

const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404

export const createProject = async (req, res, next) => {
  try {
    const { titleProject, descriptionProject, assignedTo } = req.body

    if (assignedTo?.length > 0 && req.user.systemRol !== "admin") {
      return res.status(ERROR_FORBIDDEN).send({
        message: "Only administrators can assign projects.",
      })
    }

    const users = await User.find({
      _id: { $in: assignedTo },
    })

    if (users.length !== assignedTo.length) {
      const error = new Error("One or more users not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    }

    const newProject = new Project({
      titleProject,
      descriptionProject,
      assignedTo: assignedTo || [],
      ownerId: req.user._id,
    })

    await newProject.save()

    await newProject.populate([
      { path: "ownerId", select: "name" },
      { path: "assignedTo", select: "name" },
    ])

    res.status(201).send(newProject)
  } catch (error) {
    next(error)
  }
}

export const showProjects = async (req, res, next) => {
  try {
    const match =
      req.user.systemRol === "admin"
        ? {}
        : {
            $or: [{ ownerId: req.user._id }, { assignedTo: req.user._id }],
          }

    const projects = await Project.aggregate([
      {
        $match: match,
      },

      // Buscar usuarios asignados al proyecto
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
        },
      },

      // Buscar tareas
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "idProject",
          as: "tasks",
        },
      },

      {
        $addFields: {
          totalTasks: {
            $size: "$tasks",
          },

          pendingTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: {
                  $in: ["$$task.status", ["pending", "progress"]],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          tasks: 0,
        },
      },
    ])

    res.status(200).json(projects)
  } catch (error) {
    next(error)
  }
}

export const showProject = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const match =
      req.user.systemRol === "admin"
        ? { _id: new mongoose.Types.ObjectId(projectId) }
        : {
            _id: new mongoose.Types.ObjectId(projectId),
            $or: [{ ownerId: req.user._id }, { assignedTo: req.user._id }],
          }

    const projects = await Project.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "idProject",
          as: "tasks",
        },
      },
      {
        $addFields: {
          totalTasks: { $size: "$tasks" },

          pendingTasks: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: {
                  $in: ["$$task.status", ["pending", "progress"]],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          tasks: 0,
        },
      },
    ])

    if (!projects.length) {
      return res.status(404).json({
        message: "Proyecto no encontrado",
      })
    }

    res.status(200).json(projects[0])
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      })
    }

    const isAdmin = req.user.systemRol === "admin"

    const isOwner = project.ownerId.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "You cannot delete this project.",
      })
    }

    // Eliminar todas las tareas de este proyecto
    const deletedTasks = await Task.deleteMany({
      idProject: projectId,
    })

    // Eliminar el proyecto
    await Project.findByIdAndDelete(projectId)


    return res.status(200).json({
      message: "Project deleted successfully",
      projectId,
      deletedTasks: deletedTasks.deletedCount,
    })
  } catch (error) {

    return res.status(500).json({
      message: error.message,
    })
  }
}

export const actProject = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { titleProject, descriptionProject, assignedTo } = req.body

    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    const isAdmin = req.user.systemRol === "admin"
    const isOwner = project.ownerId.toString() === req.user._id.toString()
    const isAssigned = project.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    )

    if (!isAdmin && !isOwner && !isAssigned) {
      return res.status(403).send({
        message: "You cannot edit this project.",
      })
    }

    if (titleProject !== undefined) {
      project.titleProject = titleProject
    }

    if (descriptionProject !== undefined) {
      project.descriptionProject = descriptionProject
    }

    // Solo el administrador puede asignar usuarios
    if (assignedTo !== undefined) {
      if (!isAdmin) {
        return res.status(ERROR_FORBIDDEN).send({
          message: "Only administrators can assign users.",
        })
      }

      project.assignedTo = assignedTo
    }

    await project.save()
    await project.populate("ownerId", "name")
    await project.populate("assignedTo", "name")

    res.status(200).json(project)
  } catch (error) {
    console.error("ERROR ACTUALIZANDO PROJECT:", error)
    next(error)
  }
}
