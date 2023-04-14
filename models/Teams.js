import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  photos: [{ url: { type: String } }],
  intro: {
    type: String,
    required: true,
  },
  topStays: {
    type: {
      top_stays1: {
        hotelName: String,
        location: String,
        info: String,
      },
      top_stays2: {
        hotelName: String,
        location: String,
        info: String,
      },
      top_stays3: {
        hotelName: String,
        location: String,
        info: String,
      },
      top_stays4: {
        hotelName: String,
        location: String,
        info: String,
      },
    },
  },
  topDestinations: {
    type: {
      top_destination1: {
        location: String,
        info: String,
      },
      top_destination2: {
        location: String,
        info: String,
      },
      top_destination3: {
        location: String,
        info: String,
      },
      top_stays4: {
        location: String,
        info: String,
      },
    },
  },
});

export default mongoose.model("Team", TeamSchema);
