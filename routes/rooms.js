import express from "express";
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
  updateRoomAvailability,
} from "../controllers/RoomController.js";
import { upload } from "../utils/cloudinaryStorage.js";
import {
  verifyAdmin,
  verifyMerchantAndAdmin,
  verifyToken,
} from "../utils/verifyToken.js";

const router = express.Router();

// *****CREATE ROOMS USING THE HOTEL ID******//
router.post(
  "/:hotelId/:id",
  upload.array("photos"),
  verifyMerchantAndAdmin,
  createRoom
);
// *****UPDATE******//
router.put(
  "/:id/:roomId",
  upload.array("photos"),
  verifyMerchantAndAdmin,
  updateRoom
);
// put verifyUsers here later
router.put("/update/rooms-availability/:id", updateRoomAvailability);
// *****DELETE******//
// admiin can delete rooms too
router.delete("/:roomId/:id/:hotelId", verifyMerchantAndAdmin, deleteRoom);
// *****GET******//
router.get("/:id", getRoom);
// *****GET ALL******//
router.get("/", getRooms);

export default router;
