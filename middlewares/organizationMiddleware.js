import dotenv from "dotenv"
import mime from "mime-types"
import admin from "../firebase/connect.js"

dotenv.config({ path: "../.env.development" })

export const checkExistToken = (req, res, next) => {
  const authHeader = req.header("Authorization")
  if (!authHeader) {
    return res
      .status(400)
      .json({ msg: "Chưa cung cấp Authorization Bearer Token", code: 1 })
  }
  if (authHeader) {
    const token = authHeader?.split(" ")[1]
    if (!token)
      return res.status(400).json({ msg: "Chưa cung cấp Token", code: 1 })
  }
  next()
}

export const checkCreateOrganization = (req, res, next) => {
  const { name, description, contactinfo } = req.body
  if (!name)
    return res.status(400).json({ msg: "Chưa cung cấp tên tổ chức", code: 1 })
  if (!description)
    return res
      .status(400)
      .json({ msg: "Chưa cung cấp thông tin mô tả của tổ chức", code: 1 })
  if (!contactinfo)
    return res
      .status(400)
      .json({ msg: "Chưa cung cấp thông tin liên hệ của nhóm", code: 1 })
  next()
}

export const checkUploadAvatar = (req, res, next) => {
  const file = req.file
  const authHeader = req.header("Authorization")

  if (!authHeader) {
    return res
      .status(401)
      .json({ msg: "Chưa cung cấp Authorization trong Header", code: 1 })
  }

  if (!file) {
    return res.status(400).json({ msg: "Chưa cung cấp file", code: 1 })
  }

  /** Kiểm tra loại nội dung của tệp */
  const contentType = mime.lookup(file.originalname)

  if (!contentType || !contentType.startsWith("image/")) {
    return res.status(400).json({ msg: "Tệp không phải là ảnh", code: 1 })
  }

  next()
}

export const checkAddUserToOrganization = (req, res, next) => {
  const { username, organizationId } = req.body
  if (!username)
    return res.status(400).json({ msg: "Chưa cung cấp username", code: 1 })
  if (!organizationId)
    return res
      .status(400)
      .json({ msg: "Chưa cung cấp ID của tổ chức", code: 1 })
  next()
}

export const checkExistUser = async (req, res, next) => {
  const { username } = req.body
  const membersRef = admin.database().ref("users")
  const membersDataRef = membersRef.child(`${username}`)
  const snapshot = await membersDataRef.once("value")
  if (!snapshot.exists()) {
    return res.status(404).json({ msg: "Người dùng không tồn tại", code: 1 })
  }
  next()
}

export const checkExistOrganization = async (req, res, next) => {
  const { organizationId } = req.body
  const organizationsRef = admin.database().ref("organizations")
  const organizationDataRef = organizationsRef.child(`${organizationId}`)
  const snapshot = await organizationDataRef.once("value")
  if (!snapshot.exists()) {
    return res.status(404).json({ msg: "Tổ chức không tồn tại", code: 1 })
  }
  next()
}

export const checkRequestJoinOrganization = (req, res, next) => {
  const { organizationId } = req.body
  if (!organizationId)
    return res.status(400).json({ msg: "Chưa cung cấp Id tổ chức", code: 1 })
  next()
}
