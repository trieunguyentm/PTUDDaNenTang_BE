import dotenv from "dotenv"
import admin from "../firebase/connect.js"
import { generateOTP } from "../utils/generateOTP.js"
import { sendMailRegister } from "../mailer/sendMailRegister.js"
import { hashGmail } from "../utils/utilsEmail.js"
import CryptoJS from "crypto-js"
import bcrypt from "bcrypt"
import { addUser } from "../firebase/userService.js"

dotenv.config({ path: "../.env.development" })

export const register = async (req, res) => {
  const { username, gmail, password, phone, gender } = req.body
  /** Kiểm tra sự tồn tại của username */
  const usersRef = admin.database().ref("users")
  const user = usersRef.child(`${username}`)
  const snapshot = await user.once("value")
  /** Nếu tên người dùng đã tồn tại thì trả về lỗi */
  if (snapshot.exists()) {
    return res.status(409).json({ msg: "Tên người dùng đã tồn tại" })
  }
  /** Nếu tên tài khoản chưa có thì sinh ra OTP */
  const otp = generateOTP()
  try {
    await sendMailRegister(username, gmail, password, phone, gender, otp)
    return res.status(200).json({ msg: `OTP đã được gửi đến ${gmail}` })
  } catch (error) {
    return res.status(500).json({ msg: "Lỗi khi gửi gmail xác nhận" })
  }
}

export const verifyOTP = async (req, res) => {
  const { username, gmail, password, phone, gender, otp } = req.body
  /** Lấy ra dữ liệu otpRegisters */
  const otpRegistersRef = admin.database().ref("otpRegisters")
  const otpRegister = otpRegistersRef.child(`${hashGmail(gmail)}`)
  const snapshot = await otpRegister.once("value")
  /** Nếu không tồn tại snapshot */
  if (!snapshot.exists()) {
    return res
      .status(404)
      .json({ msg: `Không tìm thấy OTP của gmail ${gmail}` })
  }
  /** Nếu tồn tại snapshot */
  const otpRegisterData = await snapshot.val()
  const expiresData = otpRegisterData.expires
  const otpData = otpRegisterData.otp
  /** Kiểm tra thời gian và otp và thông tin người dùng */
  if (otp !== otpData) {
    return res.status(400).json({ msg: "OTP không chính xác" })
  }
  if (parseInt(Date.now()) >= parseInt(expiresData)) {
    return res.status(400).json({ msg: "OTP đã hết hạn" })
  }
  if (
    username !== otpRegisterData.username ||
    gmail !== otpRegisterData.gmail ||
    password !== otpRegisterData.password ||
    phone !== phone ||
    gender !== gender
  ) {
    return res.status(400).json({ msg: "Thông tin người dùng không chính xác" })
  }
  if (otp === otpData && parseInt(Date.now()) < parseInt(expiresData)) {
    /** Reset OTP */
    try {
      await otpRegister.update({ otp: "0" })
      /** Giải mã mật khẩu */
      const _password = CryptoJS.AES.decrypt(
        password,
        process.env.KEY_AES,
      ).toString(CryptoJS.enc.Utf8)
      /** Băm mật khẩu */
      try {
        const hashedPassword = await bcrypt.hash(_password, 10)
        /** Thêm người dùng mới vào database */
        try {
          await addUser(username, {
            username,
            gmail,
            password: hashedPassword,
            phone,
            gender,
          })
          return res.status(200).json({
            msg: "Đăng ký thành công",
            info: {
              username,
              gmail,
              phone,
              gender,
            },
          })
        } catch (error) {
          return res
            .status(500)
            .json({ msg: "Lỗi xảy ra khi thêm người dùng vào database" })
        }
      } catch (error) {
        return res.status(500).json({ msg: "Lỗi xảy ra khi băm mật khẩu" })
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ msg: "Lỗi khi update OTP trên database" })
    }
  }
}
