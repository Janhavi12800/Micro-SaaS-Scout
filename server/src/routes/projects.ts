import { Router } from "express";
import { listProjects } from "../services/projects";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res, next) => {
  try {
    const projects = await listProjects(req.userId ?? "demo-user");
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});
