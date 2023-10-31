import nodemailer from "nodemailer"
import dotenv from "dotenv"
import Mailgen from "mailgen"
import admin from "../firebase/connect.js"
import { hashGmail } from "../utils/utilsEmail.js"

dotenv.config({ path: "../.env.development" })

export const sendMailRegister = async (gmail, otp) => {
  /** Kiểu của gmail */
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Xác nhận OTP đăng ký",
      link: "https://mailgen.js/",
    },
  })
  /** Nội dung gmail */
  const responseGmail = {
    body: {
      name: gmail,
      intro:
        "Bạn vừa đăng ký tài khoản trên hệ thống. Dưới đây là mã xác nhận của bạn",
      action: {
        instructions: "Vui lòng nhập mã xác nhận sau:",
        button: {
          color: "#22BC66",
          text: otp,
        },
      },
    },
  }
  /** Compile nội dung email */
  const emailBody = mailGenerator.generate(responseGmail)
  /** Tạo thông tin người gửi, nhận, tiêu đề, nội dung sau compile gmail */
  const mailOptions = {
    from: process.env.GMAIL,
    to: gmail,
    subject: "Xác nhận mã đăng ký",
    html: emailBody,
  }
  /** Tạo transporter (người vận chuyển) */
  const configTransporter = {
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  }
  const transporter = nodemailer.createTransport(configTransporter)
  /** Gửi email */
  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log("Lỗi khi gửi gmail OTP cho người dùng")
  }
  /** Lưu OTP vào database */
  const otpRegisterRef = admin.database().ref("otpRegister")
  try {
    await otpRegisterRef.child(hashGmail(gmail)).set({
      otp,
      expires: Date.now() + 2 * 60 * 1000,
    })
  } catch (error) {
    console.log("Lỗi xảy ra khi lưu OTP người dùng")
  }
}
