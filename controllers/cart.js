import Cart from "../models/Cart.js";
import Rooms from "../models/Rooms.js";

export const addToCart = async (req, res, next) => {
  const cartItem = new Cart(req.body);

  try {
    // Check if item already exists in the cart
    const existingCartItem = await Cart.findOne({
      itemId: cartItem.itemId,
      userID: cartItem.userID,
    });

    if (!existingCartItem) {
      const savedCartItem = new Cart({
        ...req.body,
      });
      await savedCartItem.save();

      return res.status(201).json({
        status: "success",
        data: savedCartItem,
      });
    }
  } catch (error) {
    return next(error);
  }
};

export const getCartItems = async (req, res, next) => {
  try {
    const cartItems = await Cart.find({ userID: req.user.id });

    return res.status(200).json({ status: "success", data: cartItems });
  } catch (error) {
    return next(error);
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    const deletedCartItem = await Cart.findByIdAndDelete(req.params.itemId);
    if (!deletedCartItem) {
      return res.status(404).json({ status: "success", msg: "Item not found" });
    }
    return res.status(200).json({ status: "success", msg: "Item deleted" });
  } catch (error) {
    return next(error);
  }
};

export const deleteAllCartItem = async (req, res, next) => {
  try {
    await Cart.deleteMany({ userID: req.params.id });
    return res.status(200).json({ status: "success" });
  } catch (error) {
    return next(error);
  }
};

export const getItemTotalQuantity = async (req, res, next) => {
  try {
    const items = await Cart.find({ userID: req.user.id });
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    let updatedCartQuantity = null;
    if (items.length > 0) {
      updatedCartQuantity = await Cart.findOneAndUpdate(
        { userID: req.user.id },
        {
          totalQuantity,
        },
        {
          new: true,
        }
      );
    }

    if (updatedCartQuantity) {
      return res
        .status(200)
        .json({ status: "success", data: updatedCartQuantity.totalQuantity });
    } else {
      return res.status(200).json({ status: "success", data: 0 });
    }
  } catch (error) {
    return next(error);
  }
};
