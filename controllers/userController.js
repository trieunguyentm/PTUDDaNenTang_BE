import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import admin from "../firebase/connect.js"

dotenv.config({ path: "../.env.development" })

export const getUserData = async (req, res) => {
  /** Lấy token và xác định username */
  const token = req.header("Authorization")?.split(" ")[1]
  const decoded = jwt.verify(token, process.env.KEY_JWT)
  const username = decoded?.username
  const usersRef = admin.database().ref("users")
  const user = usersRef.child(`${username}`)
  const snapshot = await user.once("value")
  /** Nếu người dùng không tồn tại */
  if (!snapshot.exists()) {
    return res
      .status(404)
      .json({ msg: "Không tìm thấy thông tin người dùng", code: 1 })
  }
  /** Lấy dữ liệu người dùng và trả về */
  const userData = snapshot.val()
  delete userData.password
  return res
    .status(200)
    .json({ msg: "Lấy dữ liệu thành công", code: 0, user: userData })
}
