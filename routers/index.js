import { Router } from "express"
import userRouter from "./userRouter.js"
import fileRouter from "./fileRouter.js"

const router = Router()

router.use("/auth", userRouter)
router.use("/file", fileRouter)

export default router
