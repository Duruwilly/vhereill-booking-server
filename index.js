import express from "express";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import hotelsRoutes from "./routes/hotels.js";
import roomsRoutes from "./routes/rooms.js";
import reviewsRoutes from "./routes/reviews.js";
import teamsRoutes from "./routes/teams.js";
import transactionsRoutes from "./routes/transactions.js";
import cartRoutes from "./routes/cart.js";
import favouriteRoutes from "./routes/favourite.js";
import checkAccessRoutes from "./routes/checkAccess.js";
import merchantListingsRoutes from "./routes/merchantListings.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
// const connectDB = require("./db/connect");
import mongoose from "mongoose";

const app = express();
const port = 8800;

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/logo", express.static("logo"));
app.set("view engine", "ejs");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/hotels", hotelsRoutes);
app.use("/api/v1/rooms", roomsRoutes);
app.use("/api/v1/create-reviews", reviewsRoutes);
app.use("/api/v1/teams", teamsRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/favourites", favouriteRoutes);
app.use("/api/v1/checkAccess", checkAccessRoutes);
app.use("/api/v1/merchant", merchantListingsRoutes);

app.use((err, req, res, next) => {
  // console.log(err);
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "something went wrong";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
  });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

app.listen(port, () => {
  start();
  console.log(`port is listening on port ${port}...`);
});
