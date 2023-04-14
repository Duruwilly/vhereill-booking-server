import express from "express";
import {
  getSingleTransaction,
  getTransactions,
  paymentCallback,
  paymentTransactions,
  getDatesInTransactions,
} from "../controllers/TransactionsController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/pay", paymentTransactions);

router.get(
  "/payment-callback/:status/:tx_ref/:transaction_id",
  paymentCallback
);

router.get("/customer-transactions/:id", verifyAdmin, getTransactions);

router.get("/room-date-check/:id", getDatesInTransactions);
// router.route("/").post(paymentTransactions).get(getTransactions);
// router.route("/single-transaction/:id").get(getSingleTransaction);
router.get("/single-transaction/:id", verifyAdmin, getSingleTransaction);

export default router;
