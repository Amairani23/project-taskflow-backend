import Project from "../models/project.js"

const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404

export const createProject = async (req, res, next) => {
  try {
    const { titleProject, descriptionProject } = req.body

    const newProject = new Project({
      titleProject,
      descriptionProject,
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
    const project = await Project.find({})

    res.status(200).json(project)
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

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(ERROR_FORBIDDEN)
        .send({ message: "You cannot delete another user's project." })
    }

    await project.deleteOne()

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}

export const actProject = async (req, res, next) => {
  try {
    const { titleProject, descriptionProject } = req.body

    const project = await Project.findByIdAndUpdate(
      req.project._id,
      { titleProject, descriptionProject },
      { new: true, runValidators: true },
    ).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    res.status(200).json(project)
  } catch (error) {
    next(error)
  }
}
