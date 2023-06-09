import express from "express";
import { login, register } from "../controllers/AuthController.js";
import {
  merchantLogin,
  merchantRegister,
} from "../controllers/MerchantAuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/merchant/register", merchantRegister);
router.post("/merchant/login", merchantLogin);

export default router;
