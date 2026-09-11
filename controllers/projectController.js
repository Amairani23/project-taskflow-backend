import Project from "../models/project.js"
import User from "../models/user.js"

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

    res.status(201).send(newProject)
  } catch (error) {
    next(error)
  }
}

export const showProject = async (req, res, next) => {
  try {
    let projects

    if (req.user.systemRol === "admin") {
      projects = await Project.find({})
        .populate("ownerId", "name")
        .populate("assignedTo", "name")
    } else {
      projects = await Project.find({
        //donde es el propietario O esta asignado.
        $or: [{ ownerId: req.user._id }, { assignedTo: req.user._id }],
      })
    }

    res.status(200).json(projects)
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params

    //primero buscar la tarjeta, comparar el owner con el usuario autenticado
    const project = await Project.findById(projectId).orFail(() => {
      const error = new Error("Project not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    const isAdmin = req.user.systemRol === "admin"
    const isOwner = project.ownerId.toString() === req.user._id.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).send({
        message: "You cannot delete this project.",
      })
    }

    await project.deleteOne()

    res.status(200).json(project)
  } catch (error) {
    next(error)
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

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}
