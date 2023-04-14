import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  maxPeople: {
    type: Number,
  },
  price: {
    type: Number,
  },
  roomNumbers: [{ number: Number, unavailableDates: { type: [Date] } }],
  title: {
    type: String,
  },
  dateSearch: [{ startDate: String, endDate: String }],
  days: {
    type: Number,
  },
  feature: {
    type: String,
  },
  hotelCountry: {
    type: String,
  },
  status: {
    type: String,
  },
  bookingId: {
    type: String,
  },
  hotelName: {
    type: String,
  },
  hotelAddress: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  roomOptions: {
    type: { adult: Number, children: Number },
  },
  // userID: {
  //   type: String,
  // },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hotelID: {
    type: String,
  },
  feature: {
    type: String,
  },
  itemId: {
    type: String,
  },
  userID: {
    type: String,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
});

const Cart = mongoose.model("Cart", CartSchema);
Cart.syncIndexes();
export default Cart;
