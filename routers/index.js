import { Router } from "express"
import authRouter from "./authRouter.js"
import fileRouter from "./fileRouter.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/file", fileRouter)

export default router
