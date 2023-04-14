import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    feature: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photos: [{ url: { type: String } }],
    rooms: {
      type: [String],
    },
    reviews: {
      type: [{}],
    },
    price: {
      type: Number,
      required: true,
    },
    overview: {
      type: String,
      required: true,
    },
    facilities: {
      type: String,
      required: true,
    },
    foods_and_drinks: {
      type: String,
      required: true,
    },
    // overview: {
    //   type: {
    //     overview: {
    //       type: String,
    //       required: true,
    //     },
    //     facilities: {
    //       type: String,
    //       required: true,
    //     },
    //     foods_and_drinks: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // },
    location: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("HotelList", HotelSchema);
