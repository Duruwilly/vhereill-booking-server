import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    const { password, isAdmin, ...otherDetails } = updatedUser._doc;
    res
      .status(200)
      .json({
        status: "success",
        msg: "profile updated successfully",
        data: otherDetails,
      });
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    const isPasswordCorrect = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!isPasswordCorrect) return next(createError(404, "Wrong password"));
    if (isPasswordCorrect) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      try {
        await User.findByIdAndUpdate(
          // req.user.id,
          user._id,
          {
            password: hash,
          },
          {
            new: true,
          }
        );
        res.status(200).send({ msg: "password updated successfully" });
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};



export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "user deleted" });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};
