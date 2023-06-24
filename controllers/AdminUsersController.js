import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import AdminUsers from "../models/AdminUser.js";

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await AdminUsers.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    const { password, isAdmin, ...otherDetails } = updatedUser._doc;
    return res.status(200).json({
      status: "success",
      msg: "profile updated successfully",
      data: otherDetails,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const user = await AdminUsers.findById(req.params.id);

    const isPasswordCorrect = await bcrypt.compare(
      req.body.oldPassword,
      user.password
    );

    if (!isPasswordCorrect) return next(createError(404, "Wrong password"));
    if (isPasswordCorrect) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      try {
        await AdminUsers.findByIdAndUpdate(
          // req.user.id,
          user._id,
          {
            password: hash,
          },
          {
            new: true,
          }
        );
        return res.status(200).send({ msg: "password updated successfully" });
      } catch (error) {
        return next(error);
      }
    }
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await AdminUsers.findByIdAndDelete(req.params.id);
    return res.status(200).json({ status: "success", msg: "user deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await AdminUsers.findById(req.params.id);
    const { password, ...otherDetails } = user._doc;
    return res.status(200).json({ status: "success", data: otherDetails });
  } catch (error) {
    return next(error);
  }
};

export const getUsers = async (req, res, next) => {
  const { fullname, email, role, country } = req.query;

  const queryObject = {};

  if (fullname) {
    queryObject.fullname = { $regex: `^${fullname}$`, $options: "i" };
  }

  if (email) {
    queryObject.email = { $regex: `^${email}$`, $options: "i" };
  }

  if (role) {
    queryObject.role = { $regex: `^${role}$`, $options: "i" };
  }

  if (country) {
    queryObject.country = { $regex: `^${country}$`, $options: "i" };
  }

  let totalCount = await AdminUsers.countDocuments(queryObject);

  // EXCLUDE THE PASSWORD & ISADMIN
  let result = AdminUsers.find(queryObject, { password: 0, isAdmin: 0 });

  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const users = await result;

    const usersData = users.map((user) => user._doc);

    return res.status(200).json({
      success: true,
      status: "success",
      data: usersData,
      total: totalCount,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};
