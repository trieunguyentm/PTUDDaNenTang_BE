import { Router } from "express"
import * as userMiddleware from "../middlewares/userMiddleware.js"
import * as userController from "../controllers/userController.js"

const userRouter = Router()

/** GET http://localhost:8080/api/user */
userRouter.get("/", userMiddleware.checkExistToken, userController.getUserData)

export default userRouter
