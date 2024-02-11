import Room from "../models/Rooms.js";
import Hotel from "../models/Hotels.js";
import { createError } from "../utils/error.js";
import cloudinary from "cloudinary";

export const createRoom = async (req, res, next) => {
  const hotelId = req.params.hotelId;
  const newRoom = new Room(req.body);

  try {
    const savedRoom = await newRoom.save();
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
      savedRoom.photos = photoUrls;

      await savedRoom.save();

      await Hotel.findByIdAndUpdate(hotelId, {
        $push: { rooms: savedRoom._id },
        $addToSet: { photos: { $each: photoUrls } },
      });
    } catch (error) {
      return next(error);
    }

    return res.status(200).json({
      status: "success",
      data: savedRoom,
      msg: "hotels rooms successfully added",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRoom = async (req, res, next) => {
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

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.roomId,
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
      data: updatedRoom,
      msg: "room updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRoomAvailability = async (req, res, next) => {
  try {
    await Room.updateMany(
      {
        "roomNumbers._id": req.params.id,
      },
      {
        $push: {
          // this was done this way because we are updating nested property
          "roomNumbers.$.unavailableDates": req.body.dates,
        },
      }
    );
    return res.status(200).json("Room status has been updated.");
  } catch (error) {
    return next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  const hotelId = req.params.hotelId;

  try {
    const deletedItem = await Room.findByIdAndDelete(req.params.roomId);
    if (!deletedItem) {
      return res.status(404).json({ status: "success", msg: "Item not found" });
    }
    // this is like saying that we are looking for a particular hotel and we want to update it with the room detail that is unavailable. so if there is an unavailable room created, we remove/pull it from the hotel and we update it with the room id.
    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.params.roomId },
      });
    } catch (error) {
      return next(error);
    }
    res.status(200).json({ status: "success", msg: "hotel has been deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    return res.status(200).json({ status: "success", data: room });
  } catch (error) {
    return next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(500).json(error);
  }
};
