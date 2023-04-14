import express from "express";
import {
  addToFavourite,
  deleteFavouriteItem,
  getFavouriteItems,
  getFavouriteItemTotalQuantity,
} from "../controllers/FavouriteItemController.js";

import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", addToFavourite);
router.get("/:id", verifyUser, getFavouriteItems);
router.delete("/:id/delete-favourite/:itemId", verifyUser, deleteFavouriteItem);
router.get(
  "/:id/item-total-quantity",
  verifyUser,
  getFavouriteItemTotalQuantity
);

export default router;
