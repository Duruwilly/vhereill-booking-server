import AdminUsers from "../models/AdminUser.js";
import { roles } from "../utils/checkAdminAccess.js";

export const checkRoutesPermission = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const user = await AdminUsers.findOne({ role: userRole });
    const params = req.params.id;
    const permissions = roles[user.role].permissions;
    const isAuthorize = permissions.includes(params);
    if (isAuthorize) {
      return res.status(200).json({ status: "success", isAuthorize: true });
    } else {
      return next(createError(403, "Forbidden"));
    }
  } catch (error) {
    return next(error);
  }
};
