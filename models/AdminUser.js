import mongoose from "mongoose";
import crypto from "crypto";

const AdminUserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
    },
    country: {
      type: String,
      required: true,
    },
    // token: {
    //   type: String,
    // },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "please provide valid email",
      ],
      // if there is an email already in use in the database, this will throw the duplicate error message
      unique: true,
    },
    password: {
      type: String,
      required: true,
      match: [
        /(?=.*[0-9])(?=.*[!@#$%^&*_-])(?=.*[a-z])(?=.*[A-Z]).{8,}/,
        "password must contain at lease one special character, uppercase and lowercase letters with at least a number, and must be 8 character or more",
      ],
    },
    mobileNumber: {
      type: String,
      required: true,
      min: 8,
      max: 11,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
    },
    gender: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AdminUserSchema.methods.createResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins before the password token exires
  return resetToken;
};

const AdminUsers = mongoose.model("AdminUser", AdminUserSchema);
AdminUsers.syncIndexes();
export default AdminUsers;
