import express from "express";
import { CheckRouteAccess } from "../controllers/CheckAccessController.js";
import { verifyMerchant } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/:id", verifyMerchant, CheckRouteAccess);

export default router;
