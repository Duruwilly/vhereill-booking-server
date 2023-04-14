import express from "express";
import {
  forgotpassword,
  getpasswordLink,
  resetpassword,
} from "../controllers/AuthController.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserPassword,
} from "../controllers/UsersController.js";
import { verifyAdmin, verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.put("/:id", verifyUser, updateUser);
router.put("/update-password/:id", verifyUser, updateUserPassword);
router.delete("/:id", verifyUser, deleteUser);
router.get("/:id", verifyUser, getUser);
router.get("/", verifyAdmin, getUsers);

router.route("/forgotPassword").post(forgotpassword);
router
  .route("/resetpassword/:resetToken")
  .post(resetpassword)
  .get(getpasswordLink);

export default router;
