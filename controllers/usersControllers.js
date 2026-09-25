import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js"
import Project from "../models/project.js"
import Task from "../models/task.js"

const ERROR_BAD_REQUEST = 400
const ERROR_UNAUTHORIZED = 401
const ERROR_FORBIDDEN = 403
const ERROR_NOT_FOUND = 404
const ERROR_CONFLICT = 409

const createUser = async (req, res, next) => {
  try {
    const { name, systemRol, avatar, email, password } = req.body

    if (!email || !password) {
      return res
        .status(ERROR_BAD_REQUEST)
        .send({ message: "All fields are mandatory." })
    }

    const existingUser = await User.findOne({
      email,
    })

    if (existingUser) {
      return res
        .status(ERROR_CONFLICT)
        .send({ message: "The email address is already registered." })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      systemRol,
      avatar,
      email,
      password: hashPassword,
    })

    await newUser.save()

    return res.status(201).send({
      _id: newUser._id,
      name: newUser.name,
      systemRol: newUser.systemRol,
      avatar: newUser.avatar,
      email: newUser.email,
    })
  } catch (error) {
    return next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(401).send({ message: "All fields are mandatory." })
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res
        .status(ERROR_UNAUTHORIZED)
        .send({ message: "Incorrect email or password." })
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    if (!passwordIsCorrect) {
      return res
        .status(ERROR_UNAUTHORIZED)
        .send({ message: "Incorrect email or password." })
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    )

    return res.status(200).json({
      message: "Successful login",
      token,
      user: {
        systemRol: user.systemRol,
      },
    })
  } catch (error) {
    return next(error)
  }
}

const getUser = async (req, res, next) => {
  try {
    const users = await User.find({})

    return res.status(200).json(users)
  } catch (error) {
    return next(error)
  }
}

const getUserId = async (req, res, next) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

const deleteUserId = async (req, res, next) => {
  try {
    const { userId } = req.params

    const isAdmin = req.user.systemRol === "admin"

    if (!isAdmin) {
      return res.status(ERROR_FORBIDDEN).json({
        message: "Only administrators can delete users.",
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    }

    // Buscar los proyectos del usuario
    const projects = await Project.find({
      ownerId: userId,
    })

    const projectIds = projects.map((project) => project._id)

    // Eliminar todas las tareas de esos proyectos
    const deletedTasks = await Task.deleteMany({
      idProject: projectIds,
    })

    // Eliminar los proyectos
    const deletedProjects = await Project.deleteMany({
      ownerId: userId,
    })

    // Eliminar el usuario
    await User.findByIdAndDelete(userId)

    return res.status(200).json({
      user,
      deletedProjects: deletedProjects.deletedCount,
      deletedTasks: deletedTasks.deletedCount,
    })
  } catch (error) {
    return next(error)
  }
}

const getCurrentUser = async (req, res, next) => {
  try {
    const id = req.user._id

    const user = await User.findById(id).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const { name, avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true },
    ).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

const updateRolDos = async (req, res, next) => {
  try {
    const { systemRol } = req.body
    const { userId } = req.params

    const isAdmin = req.user.systemRol === "admin"

    if (!isAdmin) {
      return res.status(ERROR_FORBIDDEN).json({
        message: "Only administrators can change user roles.",
      })
    }

    const user = await User.findById(userId)

    if (!user) {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    }

    // Verificar si hay proyectos encontrados por el usuario o asignados
    const haveProject = await Project.exists({
      $or: [{ ownerId: userId }, { assignedTo: userId }],
    })

    if (haveProject) {
      const error = new Error(
        "El usuario no puede ser admin porque tiene proyectos propios o está asignado a un proyecto.",
      )
      error.statusCode = ERROR_BAD_REQUEST
      throw error
    }

    user.systemRol = systemRol

    await user.save()

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

export {
  createUser,
  login,
  getUser,
  getUserId,
  deleteUserId,
  getCurrentUser,
  updateUser,
  updateRolDos,
}
