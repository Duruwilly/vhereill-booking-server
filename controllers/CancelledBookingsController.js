import Transactions from "../models/Transactions";

export const cancelledBookings = async (req, res, next) => {
  const tx_ref = req.params.id;
  try {
    await Transactions.updateOne(
      { reference_id: tx_ref },
      {
        $set: {
          status: "cancelled",
        },
      },
      //
      { upsert: false }
    );
    return res.status(200).json({
      status: "success",
      msg: "Transaction status updated successfully",
    });
  } catch (error) {
    return next(createError(400, "Cannot cancel this transaction"));
  }
};
