import Reviews from "../models/Reviews";
import Hotels from "../models/Hotels";

export const createReviews = async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const hotelReviews = new Reviews(req.body);

  try {
    const savedReviews = await hotelReviews.save();

    try {
      await Hotels.findByIdAndUpdate(hotelId, {
        $push: { reviews: savedReviews },
      });
    } catch (error) {
      next(error);
    }
    return res.status(200).json(savedReviews);
  } catch (error) {
    return next(error);
  }
};
