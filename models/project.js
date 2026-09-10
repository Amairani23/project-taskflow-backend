import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
  titleProject: {
    type: String,
    required: true,
    minlength: 2,
  },

  descriptionProject: {
    type: String,
    required: true,
    minlength: 2,
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Project = mongoose.model("Project", projectSchema)
export default Project
