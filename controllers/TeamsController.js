import Teams from "../models/Teams.js";

export const createTeam = async (req, res, next) => {
  const team = new Teams(req.body);

  try {
    const createdTeam = await team.save();
    return res.status(200).json({
      status: "success",
      msg: "team created successfully",
      data: createdTeam,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const updatedTeam = await Teams.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: "success",
      msg: "team profile updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    await Teams.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: "success", msg: "team profile deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const getSingleTeam = async (req, res, next) => {
  try {
    const team = await Teams.findById(req.params.id);
    return res
      .status(200)
      .json({ success: true, status: "success", data: team });
  } catch (error) {
    return next(error);
  }
};

export const getTeams = async (req, res, next) => {
  try {
    const teams = await Teams.find({});
    return res.status(200).json({
      success: true,
      status: "success",
      data: teams,
    });
  } catch (error) {
    return next(error);
  }
};
