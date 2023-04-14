import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { validatePassword } from "../utils/validatePassword.js";

export const register = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return next(createError(500, "Email already exist"));
    }

    // Validate the new password
    if (!validatePassword(req.body.password)) {
      return next(createError(400, "Password is too weak"));
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      fullname: req.body.fullname,
      country: req.body.country,
      email: req.body.email,
      password: hash,
      mobileNumber: req.body.mobileNumber,
    });
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET_KEY
    );
    // newUser.token = token;
    await newUser.save();

    // const { password, isAdmin, ...otherDetails } = newUser._doc;
    res.status(201).json({
      status: "success",
      message: "User created succesfully",
      token: token,
      id: newUser._id,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(404, "Wrong password or email"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY
    );
  
    user.save();
    res
      .status(200)
      .json({ msg: "logged in successfully", token: token, id: user._id });
  } catch (error) {
    next(error);
  }
};

export const forgotpassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(createError(404, "No user with that email"));
  const resetToken = user.createResetPassword();

  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;

  try {
    const message = `Forgot your password? kindly click on this link: ${resetURL} to reset your password.
     \nIf you didnt make this request, simply ignore. Token expires in 10 minutes`;
    sendEmail({
      email: user.email,
      subject: "Your password reset token is valid for 10 mins",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Password Reset sent to email!",
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      createError(
        500,
        "There was an error sending email, please try again later"
      )
    );
  }
};

export const getpasswordLink = async (req, res, next) => {
  try {
    const token = req.params.resetToken;
    res
      .status(302)
      .redirect(`http://localhost:3001/users/resetpassword/${token}`);
  } catch (error) {
    next(error);
  }
};

export const resetpassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return next(createError(400, "Token is invalid or expired"));

  // Validate the new password
  if (!validatePassword(req.body.password)) {
    return next(
      createError(400, "Password does not meet security requirements")
    );
  }

  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(req.body.password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // user.token = undefined;

  await user.save();
  res.status(200).json({
    status: "successfully updated Password",
  });
};

