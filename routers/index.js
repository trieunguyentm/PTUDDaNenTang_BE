import { Router } from "express"
import authRouter from "./authRouter.js"
import fileRouter from "./fileRouter.js"
import userRouter from "./userRouter.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/file", fileRouter)
router.use("/user", userRouter)

export default router
