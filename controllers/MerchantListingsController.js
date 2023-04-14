import Hotels from "../models/Hotels.js";
import Rooms from "../models/Rooms.js";

export const merchantListings = async (req, res, next) => {
  try {
    let listings = await Hotels.find({ userID: req.user.id });
    return res.status(200).json({ status: "success", data: listings });
  } catch (error) {
    return next(error)
  }
};

export const merchantRoomsListings = async (req, res, next) => {
  try {
    let listings = await Rooms.find({ userID: req.user.id });
    return res.status(200).json({ status: "success", data: listings });
  } catch (error) {
    return next(error)
  }
};
