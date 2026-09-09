import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const ERROR_BAD_REQUEST = 400
const ERROR_UNAUTHORIZED = 401
const ERROR_NOT_FOUND = 404
const ERROR_CONFLICT = 409

export const createUser = async (req, res, next) => {
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

    res.status(201).send(newUser)
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
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
    })
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req, res, next) => {
  try {
    const users = await User.find({})

    res.status(200).json(users)
  } catch (error) {
    next(error)
  }
}

export const getUserId = async (req, res, next) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req, res, next) => {
  try {
    const id = req.user._id

    const user = await User.findById(id).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const patchUser = async (req, res, next) => {
  try {
    const { name, systemRol } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, systemRol },
      { new: true, runValidators: true },
    ).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const patchUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    ).orFail(() => {
      const error = new Error("User not found")
      error.statusCode = ERROR_NOT_FOUND
      throw error
    })

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}
