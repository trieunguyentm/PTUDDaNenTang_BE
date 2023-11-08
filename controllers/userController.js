import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import admin from "../firebase/connect.js"
import { updateUser } from "../firebase/userService.js"

dotenv.config({ path: "../.env.development" })

export const getUserData = async (req, res) => {
  /** Lấy token và xác định username */
  const token = req.header("Authorization")?.split(" ")[1]
  const decoded = jwt.verify(token, process.env.KEY_JWT)
  const username = decoded?.username
  const _username = req.params.username
  if (username !== _username) {
    return res.status(200).json({
      msg: "Thông tin token không chính xác với người dùng tương ứng",
      code: 1,
    })
  }
  const usersRef = admin.database().ref("users")
  const user = usersRef.child(`${username}`)
  const snapshot = await user.once("value")
  /** Nếu người dùng không tồn tại */
  if (!snapshot.exists()) {
    return res
      .status(404)
      .json({ msg: "Không tìm thấy thông tin người dùng", code: 2 })
  }
  /** Lấy dữ liệu người dùng và trả về */
  const userData = snapshot.val()
  delete userData.password
  return res
    .status(200)
    .json({ msg: "Lấy dữ liệu thành công", code: 0, user: userData })
}

export const updateUserData = async (req, res) => {
  /** Lấy token và xác định username */
  const token = req.header("Authorization")?.split(" ")[1]
  const decoded = jwt.verify(token, process.env.KEY_JWT)
  const _username = decoded?.username
  const { username } = req.params
  if (_username !== username) {
    return res.status(200).json({
      msg: "Thông tin token không chính xác với người dùng tương ứng",
      code: 1,
    })
  }
  /** Lấy dữ liệu update và cập nhật */
  const dataUpdate = req.body
  try {
    await updateUser(username, dataUpdate)
    return res.status(200).json({ msg: "Update dữ liệu thành công", code: 0 })
  } catch (error) {
    console.log("Lỗi khi update thông tin người dùng:", error)
    return res
      .status(500)
      .json({ msg: "Lỗi khi update thông tin người dùng", code: 2 })
  }
}
