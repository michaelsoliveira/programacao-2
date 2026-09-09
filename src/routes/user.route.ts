import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { authenticate, authorize } from "@/middlewares/auth.middleware";
import { UserRole } from "@/types";

const router = Router();

const userController = new UserController();

router.get("/", authenticate, authorize([UserRole.ADMIN]), userController.getAllUsers);
router.get("/:id", authenticate, authorize([UserRole.ADMIN, UserRole.USER]), userController.getUserById);
router.post("/", authenticate, authorize([UserRole.ADMIN]), userController.createUser);
router.put("/:id", authenticate, authorize([UserRole.ADMIN, UserRole.USER]), userController.updateUser);
router.delete("/:id", authenticate, authorize([UserRole.ADMIN]), userController.deleteUser);

export default router;