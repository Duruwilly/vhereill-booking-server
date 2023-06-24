import Hotels from "../models/Hotels";

export const getHotels = async (req, res, next) => {
  const { destination, name } = req.query;

  const queryObject = {};

  if (destination) {
    queryObject.destination = { $regex: destination, $options: "i" };
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  let totalCount = await Hotels.countDocuments(queryObject);

  let result = Hotels.find(queryObject);

  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  try {
    const hotels = await result.find(queryObject);

    return res.status(200).json({
      success: true,
      status: "success",
      data: hotels,
      total: totalCount,
      per_page: limit,
    });
  } catch (error) {
    return next(error);
  }
};
