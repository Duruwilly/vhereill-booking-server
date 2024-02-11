import express from "express";
import { createServer } from "http";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import adminUsersRoutes from "./routes/adminUsers.js";
import hotelsRoutes from "./routes/hotels.js";
import roomsRoutes from "./routes/rooms.js";
import reviewsRoutes from "./routes/reviews.js";
import teamsRoutes from "./routes/teams.js";
import transactionsRoutes from "./routes/transactions.js";
import cartRoutes from "./routes/cart.js";
import favouriteRoutes from "./routes/favourite.js";
import checkAccessRoutes from "./routes/checkAccess.js";
import merchantListingsRoutes from "./routes/merchantListings.js";
import dashboardDataRoutes from "./routes/dashboardData.js";
import adminAuthRoutes from "./routes/adminAuth.js";

import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// import socket from ""
dotenv.config();
// const connectDB = require("./db/connect");
import mongoose from "mongoose";
// import { addNewUsers, getUser, removeUser } from "./socket/socket.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = 8000;

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use("/logo", express.static("logo"));
// app.set("view engine", "ejs");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminAuthRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin-users", adminUsersRoutes);
app.use("/api/v1/hotels", hotelsRoutes);
app.use("/api/v1/rooms", roomsRoutes);
app.use("/api/v1/create-reviews", reviewsRoutes);
app.use("/api/v1/teams", teamsRoutes);
app.use("/api/v1/transactions", transactionsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/favourites", favouriteRoutes);
app.use("/api/v1/checkAccess", checkAccessRoutes);
app.use("/api/v1/merchant", merchantListingsRoutes);
app.use("/api/v1/admin/dashboard", dashboardDataRoutes);

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

let usersNotification = [];

// add the user to usersNotification array when a new user connect or login from the frontend
export const addNewUsers = (userID, socketId) => {
  // console.log(userID, socketId);
  // console.log(usersNotification);
  if (!usersNotification.some((user) => user.userID === userID)) {
    usersNotification.push({ userID, socketId });
  }
};

// remove the user from the array when the user disconnect or logout from the frontend
export const removeUser = (socketId) => {
  usersNotification = usersNotification.filter(
    (user) => user.socketId !== socketId
  );
};

// this get a particular user and return that user
export const getUser = (userID) => {
  return usersNotification.find((user) => user.userID === userID);
};

io.on("connection", (socket) => {
  // console.log("dashboard has connected");
  // this takes event from the client when users connect or login
  socket.on("newUser", (userID) => {
    // add the userName and the socketId to the onlineUsers array
    addNewUsers(userID, socket.id);
    // console.log(usersNotification);
  });

  // this takes event from the client when user send notifications from the frontend
  socket.on(
    "sendNotification",
    ({
      senderID,
      receiverName,
      roomNumbers,
      roomTitles,
      firstName,
      lastName,
      bookingID,
      bookedAt,
    }) => {
      if (receiverName === "dashboard") {
        // get the dashboard to receive the event from the client side
        const receiver = getUser(receiverName);

        io.to(receiver?.socketId).emit("getNotification", {
          senderID,
          roomNumbers,
          roomTitles,
          firstName,
          lastName,
          bookingID,
          bookedAt,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const start = async (req, res, next) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("connected to mongodb");
  } catch (error) {
    console.log(error);
  }
};

httpServer.listen(8200);

app.listen(port, () => {
  start();
  console.log(`port is listening on port ${port}...`);
});
