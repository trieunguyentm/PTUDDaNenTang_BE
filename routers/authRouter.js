import { Router } from "express"

const authRouter = Router()

authRouter.get("/register", (req, res) => {
  res.send("Hello")
})

export default authRouter
