import { Router } from "express"
import * as userController from "../controllers/userController.js"
import * as userMiddleware from "../middlewares/userMiddleware.js"

const userRouter = Router()

/** POST http://localhost:8080/api/auth/register */
userRouter.post(
  "/register",
  userMiddleware.checkRegister,
  userController.register,
)

export default userRouter
