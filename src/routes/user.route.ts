import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { UserRole } from "@/types";
import { authenticate, authorize } from "@/middlewares/auth";
// import { authenticate, authorize } from "@/middlewares/auth.middleware";
// import { UserRole } from "@/types";

const router = Router();

const userController = new UserController();
router.use(authenticate);

router.get("/", authorize(UserRole.ADMIN), userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id",   userController.deleteUser);

export default router;