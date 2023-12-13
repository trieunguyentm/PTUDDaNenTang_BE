import { Router } from "express"
import authRouter from "./authRouter.js"
import fileRouter from "./fileRouter.js"
import userRouter from "./userRouter.js"
import organizationRouter from "./organizationRouter.js"
import helpRequestRouter from "./helpRequestRouter.js"

const router = Router()

router.use("/auth", authRouter)
router.use("/file", fileRouter)
router.use("/user", userRouter)
router.use("/organization", organizationRouter)
router.use("/helpRequest", helpRequestRouter)

export default router
