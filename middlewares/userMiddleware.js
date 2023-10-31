import { checkValidGmail } from "../utils/utilsEmail.js"
import { checkValidPhoneNumber } from "../utils/utilsPhone.js"

export const checkRegister = (req, res, next) => {
  const { username, gmail, password, phone, gender } = req.body
  /** Kiểm tra định dạng dữ liệu gửi lên */
  if (!username || !gmail || !password || !gender) {
    res.status(400).json({ msg: "Vui lòng điền đầy đủ thông tin" })
  }
  /** Kiểm tra tính hợp lệ của gmail */
  if (!checkValidGmail(gmail)) {
    res.status(400).json({ msg: "Địa chỉ gmail không hợp lệ" })
  }
  /** Kiểm tra tính hợp lệ của password */
  if (password.length < 6) {
    res.status(400).json({ msg: "Mật khẩu phải có độ dài ít nhất 6 ký tự" })
  }
  /** Kiểm tra tính hợp lệ của phone nếu có cung cấp */
  if (phone && !checkValidPhoneNumber(phone)) {
    res.status(400).json({ msg: "Số điện thoại không hợp lệ" })
  }
  /** Kiểm tra gender */
  if (gender !== "male" && gender !== "female") {
    res.status(400).json({ msg: "Cung cấp thông tin giới tính không hợp lệ" })
  }
  next()
}
