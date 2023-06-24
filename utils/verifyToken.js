import jwt from "jsonwebtoken";
import { roles } from "./checkAdminAccess.js";
import { createError } from "./error.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "unathenticated"));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return next(createError(403, "token invalid"));
    req.user = user;
    // console.log(req.user);
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.id === req.params?.id || req.user?.isAdmin) {
      next();
    } else {
      return next(createError(403, "unauthorized"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.isAdmin) {
      next();
    } else {
      return next(createError(403, "unauthorized"));
    }
  });
};

export const verifyMerchant = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role === req.params?.id) {
      next();
    } else {
      return next(createError(403, "unauthorized"));
    }
  });
};

export const verifyMerchantAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role === req.params?.id || req.user?.isAdmin) {
      next();
    } else {
      return next(createError(403, "unauthorized"));
    }
  });
};

export const verifyRole = (req, res, next) => {
  verifyToken(req, res, () => {
    const userRole = req?.user?.role;
    const params = req?.params?.id;
    const permissions = roles[userRole]?.permissions;
    const isAuthorize = permissions?.includes(params);
    if (isAuthorize) {
      next();
    } else {
      return next(createError(403, "Forbidden"));
    }
  });
};

// export const verifyToken = async (req, res, next) => {
//   const userId = req.params.id;
//   const user = await User.findById(userId);
//   console.log(user);
//   const token = req.cookies.access_token;
//   if (!token) {
//     return next(createError(401, "unathenticated"));
//   }
//   // this jwt return either an error or a user
//   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
//     // if it is an error
//     if (err) return next(createError(403, "token invalid"));
//     // if there is no error, then set the user info to a new request(req) property req.user
//     req.user = user;
//     console.log(req.user);
//     next();
//   });
// };

// export const verifyUser = (req, res, next) => {
//   // verify the token.. if everything is okay, it comes back here to perform what's in the call back
//   verifyToken(req, res, () => {
//     // if the id in the user object created above is equal to the params id or if it's an admin then we can do what we want
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "unauthorized"));
//     }
//   });
// };

// export const verifyAdmin = (req, res, next) => {
//   verifyToken(req, res, next, () => {
//     if (req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "unauthorized"));
//     }
//   });
// };

// import jwt from "jsonwebtoken";
// import User from "../models/Users.js";
// import { createError } from "./error.js";

// export const verifyToken = async (req, res, next) => {
//   const userId = req.params.id;
//   const user = await User.findById(userId);
//   console.log(user);
//   if (!user.token) {
//     return next(createError(401, "unathenticated"));
//   }
//   // this jwt return either an error or a user
//   jwt.verify(user.token, process.env.JWT_SECRET_KEY, (err, user) => {
//     // if it is an error
//     if (err) return next(createError(403, "token invalid"));
//     // if there is no error, then set the user info to a new request(req) property req.user
//     req.user = user;
//     next();
//   });
// };

// export const verifyUser = (req, res, next) => {
//   // verify the token.. if everything is okay, it comes back here to perform what's in the call back
//   verifyToken(req, res, () => {
//     // if the id in the user object created above is equal to the params id or if it's an admin then we can do what we want
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "unauthorized"));
//     }
//   });
// };

// export const verifyAdmin = (req, res, next) => {
//   verifyToken(req, res, next, () => {
//     if (req.user.isAdmin) {
//       next();
//     } else {
//       return next(createError(403, "unauthorized"));
//     }
//   });
// };
