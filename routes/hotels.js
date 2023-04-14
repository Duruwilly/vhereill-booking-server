import express from "express";
import {
  createHotel,
  deleteHotel,
  getHotel,
  getHotelRooms,
  getHotels,
  // getHotelsByCityName,
  updateHotel,
} from "../controllers/hotel.js";
import Hotel from "../models/Hotels.js";
import { upload } from "../utils/cloudinaryStorage.js";
import { createError } from "../utils/error.js";
import {
  verifyAdmin,
  verifyMerchant,
  verifyMerchantAndAdmin,
  verifyToken,
  verifyUser,
} from "../utils/verifyToken.js";

const router = express.Router();

// *****CREATE******//
router.post(
  "/:id",
  upload.array("photos"),
  verifyMerchantAndAdmin,
  createHotel
);
// *****UPDATE******//
router.put(
  "/:id/:hotelId",
  upload.array("photos"),
  verifyMerchantAndAdmin,
  updateHotel
);
// *****DELETE******//
// admin and merchant can delete
router.delete("/:id/:itemId", verifyMerchantAndAdmin, deleteHotel);
// *****GET SINGLE HOTEL******//
router.get("/find/:id", getHotel);
// *****GET ALL******//
router.get("/", getHotels);
// router.get("/getByCityName",  getHotelsByCityName);
router.get("/room/:id", getHotelRooms);

export default router;
