import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },

  link: {
    type: String,
    required: true,
    validate: {
      validator: (url) =>
        /^https?:\/\/(?:www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/.test(
          url,
        ),
      message: "URL inválida",
    },
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  likes:
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Card = mongoose.model("Card", cardSchema);
export default Card;
