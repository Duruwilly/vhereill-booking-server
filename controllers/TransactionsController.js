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
    console.error(error);
    return next(error);
  }
};

// export const paymentCallback = async (req, res) => {
//   const { status, tx_ref, transaction_id } = req.params;
//   console.log(status);
//   try {
//     if (status === "successful") {
//       const transactionDetails = await Transactions.findOne({
//         reference_id: tx_ref,
//       });
//       console.log(transactionDetails);
//       if (!transactionDetails) {
//         return res.status(400).json({ message: "Transaction not found" });
//       }

//       const response = await flutterwave.Transaction.verify({
//         id: transaction_id,
//       });
//       console.log(response);
//       if (
//         response?.data?.status === "successful" &&
//         response.data.amount === transactionDetails.total &&
//         response.data.currency === transactionDetails.convertedPrice
//       ) {
//         // Update the payment status in the database and send a success response
//         // await Transactions.updateOne(
//         //   { transaction_id: req.body.tx_ref },
//         //   { $set: { status: "successful" } }
//         // );
//         await Transactions.findOneAndUpdate(
//           // { reference_id: tx_ref },
//           { $set: { status: "successful", transaction_id: transaction_id } },
//           { new: true }
//         );
//         return res.status(200).json({
//           // message: "Payment successful.",
//           status: "success",
//           transaction_description: "TRANSACTION SUCCESSFUL",
//           transaction_date: new Date(),
//           transaction_data: transactionDetails,
//         });
//       } else {
//         await Transactions.updateOne(
//           // { reference_id: tx_ref },
//           { $set: { status: "failed" } },
//           { $set: { transaction_id: transaction_id } }
//         );
//         // Send a failure response if the payment verification fails
//         return res
//           .status(400)
//           .json({ message: "Payment verification failed." });
//       }
//     } else {
//       // Send a failure response if the payment was not successful
//       return res.status(400).json({ message: "Payment not successful." });
//     }
//   } catch (err) {
//     console.error(err);
//     return res
//       .status(500)
//       .json({ message: "An error occurred while processing the payment." });
//   }
// };

export const paymentCallback = async (req, res) => {
  const { status, tx_ref, transaction_id } = req.params;
  // const transactionsList = new Transactions();
  // console.log(transactionsList);
  // const { hotelID, itemId } = transactionsList;
  // console.log(hotelID, itemId);

  // let roomNumber = transactionsList.bookedRoomsOption.map((num) => num.roomNumber)[0];
  // console.log(roomNumber);
  try {
    if (status === "successful") {
      const transactionDetails = await Transactions.findOne({
        reference_id: tx_ref,
      });
      if (!transactionDetails) {
        return res.status(400).json({ message: "Transaction not found" });
      }

      // verify the payment before sending the value
      const response = await flutterwave.Transaction.verify({
        id: transaction_id,
      });
      if (
        response?.data?.status === "successful" &&
        response.data.amount === transactionDetails.total &&
        response.data.currency === transactionDetails.convertedPrice
      ) {
        // update the room status in the db to booked
        // await Rooms.findOneAndUpdate(
        //   { hotelID, roomID, roomNumber, status: "locked" },
        //   { status: "booked" },
        //   { new: true }
        // );
        // Update the payment status in the database and send a success response
        const result = await Transactions.updateOne(
          { reference_id: tx_ref },
          {
            $set: {
              status: "successful",
              transaction_id,
              bookingNumber: bookingNumber,
            },
          },
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
        // Send a failure response if the payment verification fails
        return res
          .status(400)
          .json({ message: "Payment verification failed." });
      }
    } else {
      await Transactions.updateOne(
        { reference_id: tx_ref },
        { $set: { status: "failed", transaction_id } },
        { upsert: false }
      );
      // Send a failure response if the payment was not successful
      return res.status(400).json({ message: "Payment not successful." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "An error occurred while processing the payment." });
  }
};

export const getDatesInTransactions = async (req, res, next) => {
  try {
    const transaction = await Transactions.find({
      "bookedRoomsOption.roomID": req.params.id,
      status: "successful",
    });

    //     const transaction = await Transactions.find({
    //   bookedRoomsOption: {
    //     $elemMatch: {
    //       roomID: req.params.id
    //     }
    //   },
    //   status: "successful",
    // });

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

export const getTransactions = async (req, res, next) => {
  const { transaction_id } = req.query;
  const queryObject = {};

  if (transaction_id) {
    queryObject.transaction_id = transaction_id;
  }

  let result = Transactions.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = 7;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const transactions = await result.find(queryObject);
    res.status(200).json({
      success: true,
      status: "success",
      data: transactions,
      total: transactions.length,
      per_page: limit,
    });
  } catch (error) {
    next(error);
  }
};
