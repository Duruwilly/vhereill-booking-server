import express from "express";
import {
  forgotpassword,
  getpasswordLink,
  resetpassword,
} from "../controllers/AdminAuthController.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserPassword,
} from "../controllers/AdminUsersController.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.put("/:id", verifyAdmin, updateUser);
router.put("/update-password/:id", verifyAdmin, updateUserPassword);
router.delete("/:id", verifyAdmin, deleteUser);
router.get("/:id", verifyUser, getUser);
router.get("/", getUsers);

router.route("/forgotPassword").post(forgotpassword);
router
  .route("/resetpassword/:resetToken")
  .post(resetpassword)
  .get(getpasswordLink);

export default router;
