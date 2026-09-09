import Card from "../models/card.js";

const ERROR_FORBIDDEN = 403;
const ERROR_NOT_FOUND = 404;

export const postCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;

    const newCard = new Card({
      name,
      link,
      owner: req.user._id,
    });

    await newCard.save();

    res.status(201).send(newCard);
  } catch (error) {
    next(error);
  }
};

export const getCard = async (req, res, next) => {
  try {
    const cards = await Card.find({});

    res.status(200).json(cards);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    //primero buscar la tarjeta, comparar el owner con el usuario autenticado
    const card = await Card.findById(cardId).orFail(() => {
      const error = new Error("Card not found");
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    });

    if (card.owner.toString() !== req.user._id.toString()) {
      return res.status(ERROR_FORBIDDEN).send({ message: "You cannot delete another user's cards." });
    }

    await card.deleteOne();

    res.status(200).json(card);

  } catch (error) {
    next(error);
  }
};

export const likeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } }, // agrega _id al array si aún no está ahí
      { new: true },
    ).orFail(() => {
      const error = new Error("Card not found");
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    });

    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};

export const dislikeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } }, // elimina _id del array
      { new: true },
    ).orFail(() => {
      const error = new Error("Card not found");
      error.statusCode = ERROR_NOT_FOUND;
      throw error;
    });

    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
};
