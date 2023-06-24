import express from "express";
import { CheckRouteAccess } from "../controllers/CheckAccessController.js";
import { checkRoutesPermission } from "../controllers/CheckAdminAccess.js";
import { verifyMerchant, verifyRole } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/:id", verifyMerchant, CheckRouteAccess);
router.get("/check-admin-access/:id", verifyRole, checkRoutesPermission);

export default router;
