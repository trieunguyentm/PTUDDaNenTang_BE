import { Router } from "express"
import authRouter from "./userRouter.js"

const router = Router()

router.use("/auth", authRouter)

export default router
