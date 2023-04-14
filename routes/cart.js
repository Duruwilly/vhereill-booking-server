import express from "express";
import {
  addToCart,
  deleteAllCartItem,
  deleteCartItem,
  getCartItems,
  getItemTotalQuantity,
} from "../controllers/cart.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", addToCart);
router.get("/get-cart-items/:id", verifyUser, getCartItems);
router.delete("/:id/delete-cart-item/:itemId", verifyUser, deleteCartItem);
router.delete("/delete-all-items/:id", verifyUser, deleteAllCartItem);
router.get("/:id/item-total-quantity", verifyUser, getItemTotalQuantity);

export default router;
