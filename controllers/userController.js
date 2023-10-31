import admin from "../firebase/connect.js"
import bcrypt from "bcrypt"
import { generateOTP } from "../utils/generateOTP.js"
import { sendMailRegister } from "../mailer/sendMailRegister.js"

export const register = async (req, res) => {
  const { username, gmail, password, phone, gender } = req.body
  /** Kiểm tra sự tồn tại của username */
  const usersRef = admin.database().ref("users")
  const user = usersRef.child(`${username}`)
  const snapshot = await user.once("value")
  if (snapshot.exists()) {
    return res.status(409).json({ msg: "Tên người dùng đã tồn tại" })
  }
  /** Băm mật khẩu */
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    /** Băm thành công thì lưu người dùng vào database */
    /** Viết tiếp phần tạo mã OTP với thời gian 5p cho gmail tương ứng và gửi gmail */
    const otp = generateOTP()
    try {
      await sendMailRegister(gmail, otp)
    } catch (error) {
      res.status(500).json({ msg: "Lỗi khi gửi gmail xác nhận" })
    }
    return res.status(200).json({ msg: `Đã gửi OTP đến ${gmail}` })
  } catch (error) {
    return res.status(500).json({ msg: "Lỗi khi băm mật khẩu" })
  }
}
