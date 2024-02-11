import Transactions from "../models/Transactions.js";
import Flutterwave from "flutterwave-node-v3";
import got from "got";
import sendEmail from "../utils/sendEmail.js";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import Rooms from "../models/Rooms.js";

function generateRandomString() {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

let bookingNumber = generateRandomString();

const flutterwave = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

export const paymentTransactions = async (req, res, next) => {
  const customersTransactions = new Transactions(req.body);

  try {
    const response = await got
      .post("https://api.flutterwave.com/v3/payments", {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
        json: {
          tx_ref: customersTransactions.reference_id,
          amount: customersTransactions.total,
          currency: customersTransactions.convertedPrice,
          payment_options: "card, banktransfer, ussd",
          redirect_url: "http://localhost:3001/transactions",
          // callback_url:
          //   "http://localhost:8800/api/v1/transactions/payment-callback",
          customer: {
            email: customersTransactions.email,
            phone: customersTransactions.mobileNumber,
          },
        },
      })
      .json();
    await customersTransactions.save();

    return res.json({ response });
  } catch (error) {
    return next(error);
  }
};

export const paymentCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.params;
  try {
    if (status === "successful") {
      const transactionDetails = await Transactions.findOne({
        reference_id: tx_ref,
      });
      
      if (!transactionDetails) {
        return res.status(400).json({ message: "Transaction not found" });
      }

      // VERIFY THE PAYMENT BEFORE SENDING THE VALUE
      const response = await flutterwave.Transaction.verify({
        id: transaction_id,
      });
      if (
        response?.data?.status === "successful" &&
        response.data.amount === transactionDetails.total &&
        response.data.currency === transactionDetails.convertedPrice
      ) {
        // UPDATE THE PAYMENT STATUS IN THE DATABASEE AND SEND A SUCCESS RESPONSE
        const result = await Transactions.updateOne(
          { reference_id: tx_ref },
          {
            $set: {
              status: "successful",
              transaction_id,
              bookingNumber,
            },
          },
          //
          { upsert: false }
        );
        const transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAILPASSWORD,
          },
          // secure: true,
        });
        const message = {
          from: `WillTrip <${process.env.EMAIL}>`,
          to: transactionDetails.email,
          subject: `${transactionDetails.firstName} ${" "} ${
            transactionDetails.lastName
          }, Your Booking reservation number is ${bookingNumber}`,
          html: `<div style="background-color: #eee">
          <section
            style="display: flex; justify-content: center; align-items: center"
          >
            <div style="width: 100%; max-width: 640px; padding: 1.25rem 1rem">
              <div style="background-color: white">
                <main style="border-top: 8px solid red">
                  <div
                    style="
                      background-color: rgba(17, 24, 39, 1);
                      color: white;
                      padding: 1.5rem 0;
                      text-align: center;
                    "
                  >
                    <p style="text-transform: capitalize">
                      ${transactionDetails?.bookedRoomsOption?.map(
                        (hotelName) => hotelName.hotelName
                      )} hotel
                    </p>
                    <span>
                      ${transactionDetails?.bookedRoomsOption?.map(
                        (hotelName) => hotelName.hotelAddress.toUpperCase()
                      )}
                    </span>
                  </div>
                  <div style="padding: 2.25rem 1.25rem 0">
                    <h3>
                      Dear ${transactionDetails?.lastName} ${" "} ${
            transactionDetails?.firstName
          }
                    </h3>
                    <p>
                      Your payment has been confirmed and the people at
                      ${transactionDetails?.bookedRoomsOption?.map(
                        (hotelName) => hotelName.hotelName
                      )} hotel will be delighted to have you
                      from ${transactionDetails?.bookedRoomsOption?.map(
                        (bookingDates) => ` ${format(
                          new Date(bookingDates.bookingStartDate),
                          "dd MMM yyyy"
                        )} to
                      ${format(
                        new Date(bookingDates.bookingEndDate),
                        "dd MMM yyyy"
                      )} `
                      )} Thank you for choosing us.
                    </p>
                    <p>
                      Enjoy and feel the difference with
                      ${transactionDetails?.bookedRoomsOption?.map(
                        (hotelName) =>
                          hotelName.hotelName.charAt(0).toUpperCase() +
                          hotelName.hotelName.slice(1)
                      )} Hotel.
                    </p>
                    <p>
                      Regards, <br />
                      The WillTrip Team
                    </p>
                  </div>
                  <div style="padding: 2.25rem 1.25rem">
                    <h1
                      style="
                        color: rgb(17 24 39 1);
                        text-transform: uppercase;
                        font-weight: 600;
                        font-size: 1.5rem;
                        text-align: center;
                        padding-bottom: 1.5rem;
                      "
                    >
                      Reservation summary
                    </h1>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
    
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        Reservation Number:
                      </p>
                      <span style="text-transform: capitalize; font-size: 0.875rem">
                        ${transactionDetails?.bookingNumber}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        last name:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.lastName}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        first name:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.firstName}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        phone:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.mobileNumber}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        email:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.email}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        arrival date:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.arrivalTime}
                      </span>
                    </div>
                    ${transactionDetails?.bookedRoomsOption?.map(
                      (option, index) =>
                        `
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        hotel name:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.hotelName}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        hotel location:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.hotelLocation}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        room title:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.roomTitle}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        room feature:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.feature}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        room price:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${
                          transactionDetails?.convertedPrice === "USD"
                            ? "$"
                            : transactionDetails?.convertedPrice === "EUR"
                            ? "£"
                            : "₦"
                        }
                        ${[option.roomPrice]
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        room number:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.roomNumber}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        booking dates:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${format(
                          new Date(option.bookingStartDate),
                          "dd MMM yyyy"
                        )}${" "} to ${format(
                          new Date(option.bookingEndDate),
                          "dd MMM yyyy"
                        )}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        adult:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.adult}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        children:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.children}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        children:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${option.days}
                      </span>
                    </div>
                    `
                    )}
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        check out time:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        12:00:00
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        total amount:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${
                          transactionDetails?.convertedPrice === "USD"
                            ? "$"
                            : transactionDetails?.convertedPrice === "EUR"
                            ? "£"
                            : "₦"
                        }
                        ${[transactionDetails?.total]
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: center;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
                          flex: 1;
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        transaction id:
                      </p>
                      <span
                        style="
                          text-transform: capitalize;
                          font-size: 0.875rem;
                          flex: 2;
                        "
                      >
                        ${transactionDetails?.reference_id}
                      </span>
                    </div>
                    <div
                      style="
                        justify-content: space-between;
                        align-items: center;
                        padding-bottom: 0.5rem;
                      "
                    >
                      <p
                        style="
                          font-weight: 600;
                          text-transform: capitalize;
    
                          font-size: 1rem;
                          line-height: 1.5rem;
                        "
                      >
                        transaction status:
                      </p>
                      <span style="text-transform: capitalize; font-size: 0.875rem">
                        Transaction Successful
                      </span>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </section>
        </div>`,
        };
        transporter.sendMail(message);
        if (result.modifiedCount === 1) {
          return res.status(200).json({
            status: "success",
            transaction_description: "TRANSACTION SUCCESSFUL",
            transaction_date: new Date(),
            transaction_data: transactionDetails,
          });
        } else {
          return res.status(500).json({
            message: "Payment status could not be updated.",
          });
        }
      } else {
        await Transactions.updateOne(
          { reference_id: tx_ref },
          { $set: { status: "failed", transaction_id } },
          { upsert: false }
        );

        // SEND A FAILURE RESPONSE IF THE PAYMENT VERIFICATION FAILS
        // add the ref to the frontend receipt later
        return res
          .status(400)
          .json({ ref: tx_ref, message: "Payment verification failed." });
      }
    } else {
      await Transactions.updateOne(
        { reference_id: tx_ref },
        { $set: { status: "failed", transaction_id } },
        { upsert: false }
      );

      // SEND A FAILURE RESPONSE IF THE PAYMENT WAS NOT SUCCESSFUL
      return res
        .status(400)
        .json({ ref: tx_ref, message: "Payment not successful." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "An error occurred while processing the payment." });
  }
};

// GET THE BOOKED DATES FROM SUCCESSFUL TRANSACTIONS
export const getDatesInTransactions = async (req, res, next) => {
  try {
    const transaction = await Transactions.find({
      "bookedRoomsOption.roomID": req.params.id,
      status: "successful",
    });

    return res
      .status(200)
      .json({ success: true, status: "success", data: transaction });
  } catch (error) {
    return next(error);
  }
};

export const getSingleTransaction = async (req, res, next) => {
  try {
    const transaction = await Transactions.find({ userID: req.user.id });

    return res
      .status(200)
      .json({ success: true, status: "success", data: transaction });
  } catch (error) {
    return next(error);
  }
};

export const getTransactionStatus = async (req, res, next) => {
  const { statusType } = req.params;
  const { transaction_id, reference_id, status, firstName, lastName, email } =
    req.query;
  const queryObject = {};

  if (transaction_id) {
    queryObject.transaction_id = transaction_id;
  }

  if (reference_id) {
    queryObject.reference_id = reference_id;
  }

  if (status) {
    queryObject.status = { $regex: `^${status}$`, $options: "i" };
  }

  if (firstName) {
    queryObject.firstName = { $regex: `^${firstName}$`, $options: "i" };
  }

  if (lastName) {
    queryObject.lastName = { $regex: `^${lastName}$`, $options: "i" };
  }

  if (email) {
    queryObject.email = { $regex: `^${email}$`, $options: "i" };
  }

  let resultQuery = statusType
    ? Transactions.find({ status: statusType })
    : Transactions.find(queryObject);

  const totalCountQuery = statusType
    ? Transactions.countDocuments({ status: statusType })
    : Transactions.countDocuments(queryObject);

  const totalCount = await totalCountQuery;
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  resultQuery = resultQuery.skip(skip).limit(limit);

  try {
    const transactions = await resultQuery.find(queryObject);
    return res.status(200).json({
      success: true,
      status: "success",
      data: transactions,
      total: totalCount,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  const {
    transaction_id,
    reference_id,
    status,
    firstName,
    lastName,
    email,
    bookingNumber,
  } = req.query;
  const queryObject = {};

  if (transaction_id) {
    queryObject.transaction_id = transaction_id;
  }

  if (reference_id) {
    queryObject.reference_id = reference_id;
  }

  if (bookingNumber) {
    queryObject.bookingNumber = { $regex: `^${bookingNumber}$`, $options: "i" };
  }

  if (status) {
    queryObject.status = { $regex: `^${status}$`, $options: "i" };
  }

  if (firstName) {
    queryObject.firstName = { $regex: `^${firstName}$`, $options: "i" };
  }

  if (lastName) {
    queryObject.lastName = { $regex: `^${lastName}$`, $options: "i" };
  }

  if (email) {
    queryObject.email = { $regex: `^${email}$`, $options: "i" };
  }

  let totalCount = await Transactions.countDocuments(queryObject);

  let result = Transactions.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const transactions = await result.find(queryObject);
    return res.status(200).json({
      success: true,
      status: "success",
      data: transactions,
      total: totalCount,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelledBookings = async (req, res, next) => {
  const tx_ref = req.params.tx_ref;

  const transactionDetails = await Transactions.findOne({
    reference_id: tx_ref,
  });

  if (transactionDetails.status === "cancelled") {
    return res
      .status(400)
      .json({ message: "Reservation has already been cancelled" });
  }

  if (!transactionDetails) {
    return res.status(400).json({ message: "Reservation not found" });
  }

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

    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASSWORD,
      },
      // secure: true,
    });
    const message = {
      from: `WillTrip <${process.env.EMAIL}>`,
      to: transactionDetails.email,
      subject: `${transactionDetails.firstName} ${" "} ${
        transactionDetails.lastName
      }, Your Cancelled reservation number is ${bookingNumber}`,
      html: `<div style="background-color: #eee">
      <section
        style="display: flex; justify-content: center; align-items: center"
      >
        <div style="width: 100%; max-width: 640px; padding: 1.25rem 1rem">
          <div style="background-color: white">
            <main style="border-top: 8px solid red">
              <div
                style="
                  background-color: rgba(17, 24, 39, 1);
                  color: white;
                  padding: 1.5rem 0;
                  text-align: center;
                "
              >
                <p style="text-transform: capitalize">
                  ${transactionDetails?.bookedRoomsOption?.map(
                    (hotelName) => hotelName.hotelName
                  )} hotel
                </p>
                <span>
                  ${transactionDetails?.bookedRoomsOption?.map((hotelName) =>
                    hotelName.hotelAddress.toUpperCase()
                  )}
                </span>
              </div>
              <div style="padding: 2.25rem 1.25rem 0">
                <h3>
                  Dear ${transactionDetails?.lastName} ${" "} ${
        transactionDetails?.firstName
      }
                </h3>
                <p>
                  We've successfully canceled your reservation at 
                  ${transactionDetails?.bookedRoomsOption?.map(
                    (hotelName) => hotelName.hotelName
                  )} hotel.
                </p>
                <p>
                  Regards, <br />
                  The WillTrip Team
                </p>
              </div>
              <div style="padding: 2.25rem 1.25rem">
                <h1
                  style="
                    color: rgb(17 24 39 1);
                    text-transform: uppercase;
                    font-weight: 600;
                    font-size: 1.5rem;
                    text-align: center;
                    padding-bottom: 1.5rem;
                  "
                >
                  Reservation summary
                </h1>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;

                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    Reservation Number:
                  </p>
                  <span style="text-transform: capitalize; font-size: 0.875rem">
                    ${transactionDetails?.bookingNumber}
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    last name:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    ${transactionDetails?.lastName}
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    first name:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    ${transactionDetails?.firstName}
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    arrival date:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    ${transactionDetails?.arrivalTime}
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    check out time:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    12:00:00
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    total amount:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    0.00
                  </span>
                </div>
                <div
                  style="
                    justify-content: center;
                    align-items: center;
                    padding-bottom: 0.5rem;
                  "
                >
                  <p
                    style="
                      font-weight: 600;
                      text-transform: capitalize;
                      flex: 1;
                      font-size: 1rem;
                      line-height: 1.5rem;
                    "
                  >
                    booking status:
                  </p>
                  <span
                    style="
                      text-transform: capitalize;
                      font-size: 0.875rem;
                      flex: 2;
                    "
                  >
                    ${transactionDetails?.status}
                  </span>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>`,
    };
    transporter.sendMail(message);
    return res.status(200).json({
      status: "success",
      msg: "Your reservation has been cancelled succesfully",
    });
  } catch (error) {
    return next(createError(400, "Cannot cancel this transaction"));
  }
};

export const getBookings = async (req, res, next) => {
  let queryObject = { bookingNumber: { $exists: true } };
  const { bookingNumber } = req.query;

  if (bookingNumber) {
    queryObject.bookingNumber = { $regex: `^${bookingNumber}$`, $options: "i" };
  }

  let totalCount = await Transactions.countDocuments(queryObject);

  let result = Transactions.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const transactions = await result.find(queryObject);
    return res.status(200).json({
      success: true,
      status: "success",
      data: transactions,
      total: totalCount,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};
