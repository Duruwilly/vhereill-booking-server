import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
    },
    maxPeople: {
      type: Number,
      required: true,
    },
    photos: [{ url: { type: String } }],
    userID: {
      type: String,
    },
    status: {
      type: String,
      enum: ["available", "locked", "booked"],
      default: "available",
    },
    // unavailableDates to be array or object
    roomNumbers: [{ number: Number, unavailableDates: { type: [Date] } }],
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Room", RoomSchema);
