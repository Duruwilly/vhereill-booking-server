import Favourites from "../models/Favourites.js";

export const addToFavourite = async (req, res, next) => {
  const favouriteItems = new Favourites(req.body);

  try {
    const savedItems = await favouriteItems.save();
    return res.status(201).json({ status: "success", data: savedItems });
  } catch (error) {
    return next(error);
  }
};

export const getFavouriteItems = async (req, res, next) => {
  try {
    const favouriteItems = await Favourites.find({ userID: req.user.id });
    return res.status(200).json({ status: "success", data: favouriteItems });
  } catch (error) {
    return next(error);
  }
};

export const deleteFavouriteItem = async (req, res, next) => {
  try {
    const deletedFavouriteItem = await Favourites.findByIdAndDelete(
      req.params.itemId
    );
    if (!deletedFavouriteItem) {
      return res.status(404).json({ status: "success", msg: "Item not found" });
    }
    return res.status(200).json({ status: "success", msg: "Item deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getFavouriteItemTotalQuantity = async (req, res, next) => {
  try {
    const items = await Favourites.find({ userID: req.user.id });
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

    let updatedFavouriteQuantity = null;
    if (items.length > 0) {
      updatedFavouriteQuantity = await Favourites.findOneAndUpdate(
        { userID: req.user.id },
        {
          totalQuantity,
        },
        {
          new: true,
        }
      );
    }

    if (updatedFavouriteQuantity) {
      return res.status(200).json({
        status: "success",
        data: updatedFavouriteQuantity.totalQuantity,
      });
    } else {
      return res.status(200).json({ status: "success", data: 0 });
    }
  } catch (error) {
    return next(error);
  }
};
