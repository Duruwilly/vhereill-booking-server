import express from "express";
// import { createReviews } from "../controllers/reviews";
// import { createReviews } from "../controllers/reviews.js"
import { createReviews } from "../controllers/HotelController.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/:hotelID", createReviews);

export default router;
