import express from "express";
import {
  getBookings,
  getMerchantUsers,
  getTransactions,
  getUsers,
} from "../controllers/DashboardController.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/merchant-users/:roleId", getMerchantUsers);
router.get("/transactions", getTransactions);
router.get("/bookings", getBookings);

export default router;
