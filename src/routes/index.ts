import { Router } from "express";
import userRoutes from "./user.route";
const routes = Router();

routes.use("/users", userRoutes);

routes.get("/", (req, res) => {
  res.json({ message: "Store API - Node.js + Express + TypeScript" });
});

export default routes;