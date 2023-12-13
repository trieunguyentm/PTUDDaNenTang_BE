import admin from "../firebase/connect.js"
import jwt from "jsonwebtoken"

export const createHelpRequest = async (req, res) => {
  const { title, description } = req.body
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  let username
  try {
    const decoded = await jwt.verify(token, process.env.KEY_JWT)
    username = decoded.username
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ msg: "Lỗi xảy ra khi xác minh token", code: 2 })
  }
  const files = req.files
  const imageUrls = []

  // Upload các ảnh lên Firebase Storage và lấy URL
  for (const file of files) {
    const fileRef = admin
      .storage()
      .bucket()
      .file(`helpRequest/${username}/${file.originalname}`)
    await fileRef.save(file.buffer)
    const url = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    })
    imageUrls.push(url[0])
  }
  try {
    const helpRequestRef = admin.database().ref("helpRequests").push()
    await helpRequestRef.set({
      id: helpRequestRef.key,
      title,
      description,
      images: imageUrls,
      createdBy: username,
      createAt: new Date().toISOString(),
      status: 0,
    })
    /** Sau khi lấy được imageUrls thì lưu thông tin yêu cầu hỗ trợ */
    return res.status(200).json({
      msg: "Tạo yêu cầu hỗ trợ thành công",
      code: 0,
      data: {
        id: helpRequestRef.key,
        title,
        description,
        images: imageUrls,
        createdBy: username,
        createAt: new Date().toISOString(),
        status: 0,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ msg: "Xảy ra lỗi khi tải ảnh", code: 3 })
  }
}