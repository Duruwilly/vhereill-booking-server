import Users from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import { validatePassword } from "../utils/validatePassword.js";

export const merchantRegister = async (req, res, next) => {
  try {
    const newUser = await Users.findOne({ email: req.body.email });
    if (newUser) {
      return next(createError(400, "Email already exist"));
    }
    //   validate password
    if (!validatePassword(req.body.password)) {
      return next(createError(400, "Password is too weak"));
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const merchantUser = new Users({
      fullname: req.body.fullname,
      country: req.body.country,
      email: req.body.email,
      password: hash,
      mobileNumber: req.body.mobileNumber,
      role: "merchant",
    });
    const token = jwt.sign(
      { id: merchantUser._id, role: merchantUser.role },
      process.env.JWT_SECRET_KEY
    );

    await merchantUser.save();
    res.status(201).json({
      status: "success",
      message: "User created succesfully",
      token: token,
      id: merchantUser._id,
    });
  } catch (error) {
    next(error);
  }
};

export const merchantLogin = async (req, res, next) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(404, "Wrong password or username"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, role: user.role },
      process.env.JWT_SECRET_KEY
    );
    // const { password, isAdmin, ...otherDetails } = user._doc;
    // user.token = token;
    user.save();
    res
      .status(200)
      .json({ msg: "logged in successfully", token: token, id: user._id });
  } catch (error) {
    next(error);
  }
};
