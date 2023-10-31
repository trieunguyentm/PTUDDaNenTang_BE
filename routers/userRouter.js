import { Router } from "express"

const userRouter = Router()

userRouter.get("/register", (req, res) => {
  res.send("Hello")
})

export default userRouter
