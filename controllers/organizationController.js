import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {
  createNewOrganization,
  getOrganization,
  updateOrganization,
} from "../firebase/organizationService.js"
import admin from "../firebase/connect.js"
import { getOrganizationByUserService } from "../firebase/organizationService.js"

dotenv.config({ path: "../.env.development" })
/** Tạo storage bucket */
const bucket = admin.storage().bucket()

export const createOrganization = async (req, res) => {
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  /** Giải token */
  try {
    const decoded = await jwt.verify(token, process.env.KEY_JWT)
    /** Tạo nhóm */
    const { name, description, contactinfo } = req.body
    try {
      const organizationInfo = await createNewOrganization(
        {
          name,
          description,
          contactinfo,
          createdAt: new Date().toString(),
          creator: decoded.username,
        },
        decoded.username,
      )
      return res.status(200).json({
        msg: "Tạo tổ chức thành công thành công",
        code: 0,
        data: organizationInfo,
      })
    } catch (error) {
      console.log("Xảy ra lỗi khi tạo tổ chức")
      return res
        .status(500)
        .json({ msg: "Xảy ra lỗi khi tạo tổ chức", code: 3 })
    }
  } catch (error) {
    console.log("Xảy ra lỗi khi phân giải token")
    return res
      .status(500)
      .json({ msg: "Xảy ra lỗi khi phân giải token", code: 2 })
  }
}

export const uploadAvatarOrganization = async (req, res) => {
  const { organizationId } = req.params
  const file = req.file
  const token = req.header("Authorization")?.split(" ")[1]
  let username
  if (!token) {
    return res.status(401).json({ msg: "Chưa cung cấp token", code: 2 })
  }
  try {
    const decoded = jwt.verify(token, process.env.KEY_JWT)
    username = decoded.username
  } catch (error) {
    console.log("Xảy ra lỗi khi upload")
    return res.status(500).json({ msg: "Xảy ra lỗi upload avatar", code: 3 })
  }

  if (!token || !file) {
    return res
      .status(400)
      .json({ msg: "Thiếu thông tin về token hoặc tệp", code: 4 })
  }
  /** Lấy thông tin tổ chức dựa trên Id sau đó xác định quyền của người dùng */
  try {
    const organizationData = await getOrganization(organizationId)
    if (organizationData.creator !== username) {
      return res.status(403).json({
        msg: "Bạn không có quyền thay đổi thông tin của tổ chức này",
        code: 4,
      })
    }
  } catch (error) {
    console.log("Lỗi khi lấy dữ liệu tổ chức")
    return res
      .status(500)
      .json({ msg: "Lỗi khi lấy dữ liệu từ tổ chức", code: 5 })
  }
  /** Đường dẫn trên Firebase Storage */
  const remoteFilePath = `organization/${organizationId}/${file.originalname}`
  console.log("remoteFilePath:", remoteFilePath)
  /** Tải lên tệp vào Firebase Storage */
  const blob = bucket.file(remoteFilePath)
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  })

  blobStream.on("error", (error) => {
    console.error("Lỗi khi tải lên tệp:", error)
    return res.status(500).json({ msg: "Lỗi khi tải lên tệp", code: 6 })
  })

  blobStream.on("finish", () => {
    /** Lấy URL tải xuống */
    blob.getSignedUrl(
      {
        action: "read",
        expires: "01-01-2030",
      },
      async (err, url) => {
        if (err) {
          console.error("Lỗi khi lấy URL tải xuống:", err)
          return res
            .status(500)
            .json({ msg: "Lỗi khi lấy URL tải xuống", code: 7 })
        } else {
          console.log("Tệp đã được tải lên thành công.")
          console.log("URL của tệp đã tải lên:", url)
          /** Sau khi có url của ảnh, lấy url để làm avatar cho tổ chức */
          try {
            /** Update thông tin tổ chức */
            await updateOrganization(organizationId, { urlAvatar: url })
            /** Lấy dữ liệu tổ chức */
            const orgData = await getOrganization(organizationId)
            return res.status(200).json({
              msg: "Tệp đã được tải lên thành công",
              code: 0,
              orgData,
            })
          } catch (error) {
            console.log("Xảy ra lỗi khi cập nhật avatar tổ chức")
            return res.status(500).json({
              msg: "Xảy ra lỗi khi cập nhật avatar tổ chức",
              code: 8,
            })
          }
        }
      },
    )
  })

  blobStream.end(file.buffer)
}

export const getOrganizationByUser = async (req, res) => {
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.KEY_JWT)
    const username = decoded.username
    try {
      const orangizations = await getOrganizationByUserService(username)
      return res
        .status(200)
        .json({ msg: "Thành công", code: 0, data: orangizations })
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({ msg: "Lỗi khi lấy danh sách tổ chức thỏa mãn", code: 2 })
    }
  } catch (error) {
    return res.status(500).json({ msg: "Lỗi khi xác minh token", code: 1 })
  }
}
