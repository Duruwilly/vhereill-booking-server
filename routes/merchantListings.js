import express from "express";
import { merchantListings, merchantRoomsListings } from "../controllers/MerchantListingsController.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/get-listings/:id", verifyUser, merchantListings);
router.get("/get-rooms/:id", verifyUser, merchantRoomsListings)

export default router;
