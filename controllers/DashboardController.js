import Transactions from "../models/Transactions.js";
import Users from "../models/Users.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await Users.find(
      {},
      {
        password: 0,
        isAdmin: 0,
        resetPasswordExpires: 0,
        resetPasswordToken: 0,
        token: 0,
      }
    );
    // const {
    //   //   password,
    //   isAdmin,
    //   resetPasswordExpires,
    //   resetPasswordToken,
    //   token,
    //   ...otherdetails
    // } = users._doc;

    return res.status(200).json({
      success: true,
      status: "success",
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMerchantUsers = async (req, res, next) => {
  const { roleId } = req.params;
  try {
    const users = await Users.find({ role: roleId });
    return res.status(200).json({
      success: true,
      status: "success",
      data: users,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transactions.find({});
    return res.status(200).json({
      success: true,
      status: "success",
      data: transactions,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookings = async (req, res, next) => {
  let queryObject = { bookingNumber: { $exists: true } };

  try {
    const bookings = await Transactions.find(queryObject);
    return res.status(200).json({
      success: true,
      status: "success",
      data: bookings,
    });
  } catch (error) {
    return next(error);
  }
};
