import Users from "../models/Users.js";

// CHECK USERS ACCESS TO ROUTE
export const CheckRouteAccess = async (req, res, next) => {
  try {
    const user = await Users.findOne({ role: req.user.role });
    if (user.role === "merchant") {
      return res.status(200).json({ status: "success", isAuthorize: true});
    } else {
      return false;
    }
  } catch (error) {
    next(error);
  }
};
