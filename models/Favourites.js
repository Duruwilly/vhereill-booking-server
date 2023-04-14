import mongoose from "mongoose";

const FavouriteSchema = new mongoose.Schema({
  price: {
    type: Number,
  },
  itemId: {
    type: String,
  },
  destination: {
    type: String,
  },
  name: {
    type: String,
  },
  // userID: {
  //   type: String,
  // },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feature: {
    type: String,
  },
  photos: [{ url: { type: String } }],
  totalQuantity: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
  },
});

const Favourites = mongoose.model("Favourite", FavouriteSchema);
Favourites.syncIndexes();
export default Favourites;
