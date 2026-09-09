import { Router } from "express";

const routes = Router();

routes.get("/", (req, res) => {
  res.json({ message: "Sotre API - Node.js + Express + TypeScript" });
});

export default routes;