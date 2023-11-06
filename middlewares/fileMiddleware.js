import dotenv from "dotenv"

dotenv.config({ path: "../.env.development" })

export const checkUploadAvatar = (req, res, next) => {
  const file = req.file
  const authHeader = req.header("Authorization")
  if (!authHeader) {
    return res
      .status(401)
      .json({ msg: "Chưa cung cấp Authorization trong Header" })
  }
  if (!file) {
    return res.status(400).json({ msg: "Chưa cung cấp file" })
  }
  next()
}
