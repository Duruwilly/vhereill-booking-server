import express from "express";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  getSingleTeam,
  getTeams,
} from "../controllers/TeamsController.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyAdmin, createTeam);
router.put("/:id", verifyAdmin, updateTeam);
router.delete("/:id", verifyAdmin, deleteTeam);
router.get("/find/:id", getSingleTeam);
router.get("/", getTeams);

export default router;
