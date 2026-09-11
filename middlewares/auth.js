import jwt from "jsonwebtoken"
import User from "../models/user.js"

export const auth = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Authorization is required." })
  }

  const token = authorization.replace("Bearer ", "")
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(payload._id)

    if (!user) {
      return res.status(401).send({
        message: "Authorization is required.",
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(401).send({
      message: "Authorization is required.",
    })
  }
}
