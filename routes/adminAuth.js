import express from "express";
import {
  adminLogin,
  adminRegister,
} from "../controllers/AdminAuthController.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// verify admin here later
router.post("/auth/create", verifyAdmin, adminRegister);
router.post("/auth", adminLogin);

export default router;
