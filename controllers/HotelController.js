import Hotel from "../models/Hotels.js";
import Room from "../models/Rooms.js";
import Reviews from "../models/Reviews.js";
import cloudinary from "cloudinary";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);

  try {
    if (req.user.role === "merchant") {
      const savedHotel = await newHotel.save();

      try {
        const photoUrls = [];
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const result = await cloudinary.v2.uploader.upload(file.path);
            photoUrls.push({ url: result.secure_url });
          } catch (error) {
            return next(error);
          }
        }
        savedHotel.photos = photoUrls;

        await savedHotel.save();
      } catch (error) {
        return next(error);
      }
      return res.status(200).json({
        status: "success",
        data: savedHotel,
        msg: "hotels successfully listed",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const photoUrls = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const result = await cloudinary.v2.uploader.upload(file.path);
        photoUrls.push({ url: result.secure_url });
      } catch (error) {
        return next(error);
      }
    }
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.hotelId,
      {
        $set: req.body,
        $addToSet: { photos: { $each: photoUrls } },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: "success",
      data: updatedHotel,
      msg: "hotel updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    const deletedItem = await Hotel.findByIdAndDelete(req.params.itemId);
    if (!deletedItem) {
      return res.status(404).json({ status: "success", msg: "Item not found" });
    }
    res.status(200).json({ status: "success", msg: "hotel has been deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    return res
      .status(200)
      .json({ success: true, status: "success", data: hotel });
  } catch (error) {
    return next(error);
  }
};

export const getHotels = async (req, res, next) => {
  const { destination } = req.query;
  const queryObject = {};

  if (destination) {
    // if a name property matches any of the letter passed in the query... case sensitive
    queryObject.destination = { $regex: destination, $options: "i" };
    // queryObject.country = country;
  }

  let result = Hotel.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = 7;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const hotels = await result.find(queryObject);
    return res.status(200).json({
      success: true,
      status: "success",
      data: hotels,
      total: hotels.length,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    // using promise.all because we have multiple room.
    // for each room, we are going to return the rooms
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    return res
      .status(200)
      .json({ success: true, status: "success", data: list });
  } catch (error) {
    return next(error);
  }
};

export const createReviews = async (req, res, next) => {
  const hotelId = req.params.hotelID;
  const hotelReviews = new Reviews(req.body);

  try {
    const savedReviews = await hotelReviews.save();

    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { reviews: savedReviews },
      });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({ status: "success", savedReviews });
  } catch (error) {
    return next(error);
  }
};
