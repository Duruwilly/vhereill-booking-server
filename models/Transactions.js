import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      // unique: true,
      // required: true,
    },
    bookingNumber: {
      type: String,
    },
    reference_id: {
      type: String,
      unique: true,
      required: true,
    },
    // userID: {
    //   type: String,
    //   required: true,
    // },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
    },
    status: {
      type: String,
      default: "pending",
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "please provide valid email",
      ],
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    convertedPrice: {
      type: String,
    },
    bookedRoomsOption: {
      type: [
        {
          hotelName: {
            type: String,
          },
          hotelID: {
            type: String,
          },
          roomID: {
            type: String,
          },
          hotelAddress: {
            type: String,
          },
          hotelLocation: {
            type: String,
          },
          roomTitle: {
            type: String,
          },
          roomMaxGuest: {
            type: Number,
          },
          feature: {
            type: String,
          },
          roomPrice: {
            type: Number,
          },
          roomNumber: {
            type: Number,
          },
          bookingStartDate: {
            type: String,
          },
          bookingEndDate: {
            type: String,
          },
          adult: {
            type: Number,
          },
          children: {
            type: Number,
          },
          days: {
            type: Number,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// TransactionSchema.index({ request_id: 1 });
const Transactions = mongoose.model("Transaction", TransactionSchema);

// Transactions.collection.dropIndexes('transaction_id', (err, result) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(result);
//   }
// });

// Transactions.collection.dropIndex({ transaction_id: 1 }, function (err, result) {
//   if (err) {
//     console.log("Error dropping index:", err);
//   } else {
//     console.log("Index dropped successfully.:", result);
//   }
// });

// Transactions.createIndexes();
// Transactions.syncIndexes();

export default Transactions;
