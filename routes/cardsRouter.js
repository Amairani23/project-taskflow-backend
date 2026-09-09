import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import validator from "validator";

import {
  deleteCard,
  dislikeCard,
  getCard,
  likeCard,
  postCard,
} from "../controllers/cardsControllers.js";

const router = express.Router();

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }

  return helpers.error("string.uri");
};


// Crear tarjeta
router.post("/cards",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      link: Joi.string().custom(validateURL).required(),
    }),
  }),
  postCard
);

// Muestra tarjetas
router.get("/cards", getCard);

// Elimina tarjeta
router.delete(
  "/cards/:cardId",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteCard
);

// Like a una tarjeta
router.put(
  "/cards/:cardId/likes",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  likeCard
);

// Dislike a una tarjeta
router.delete(
  "/cards/:cardId/likes",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24).required(),
    }),
  }),
  dislikeCard
);

export default router;
