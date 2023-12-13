import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {
  checkRequestOfUser,
  createNewOrganization,
  getOrganization,
  updateOrganization,
} from "../firebase/organizationService.js"
import admin from "../firebase/connect.js"
import { getOrganizationByUserService } from "../firebase/organizationService.js"
import { CHUA_XU_LY, DONG_Y, TU_CHOI } from "../utils/constraint.js"

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

export const getAllOrganization = async (req, res) => {
  try {
    const organizationsRef = admin.database().ref("organizations")
    let listOrg = []
    await organizationsRef.once("value", (snapshot) => {
      listOrg = Object.values(snapshot.val())
    })
    return res.status(200).json({ msg: "Thành công", code: 0, data: listOrg })
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Lỗi khi lấy toàn bộ danh sách tổ chức", code: 1 })
  }
}

export const addUserToOrganization = async (req, res) => {
  const { username, organizationId } = req.body
  /** Lấy dữ liệu tổ chức */
  const organizationData = await getOrganization(organizationId)
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  /** Verify token */
  try {
    const decoded = jwt.verify(token, process.env.KEY_JWT)
    /** Kiểm tra quyền thực hiện của người dùng */
    if (decoded.username !== organizationData.creator) {
      return res
        .status(403)
        .json({ msg: "Không có quyền thực hiện thao tác", code: 3 })
    }
    /** Nếu có quyền thực hiện thì tiếp tục kiểm tra xem người dùng đã có sẵn trong nhóm chưa*/
    /** Tham chiếu đến nút memberOrganizations sau đó lấy ra Object chứa các thành viên */
    const memberOrganizationRef = admin.database().ref("memberOrganizations")
    const memberOrganizationsData = memberOrganizationRef.child(
      `${organizationId}`,
    )
    const snapshot = await memberOrganizationsData.once("value")
    const dataMemeberInOrganization = snapshot.val()
    /** Kiểm tra xem người dùng đã có trong tổ chức hay chưa */
    if (dataMemeberInOrganization[username]) {
      return res.status(403).json({
        msg: "Yêu cầu bị từ chối do người dùng đã tồn tại trong tổ chức",
        code: 4,
      })
    }
    /** Nếu người dùng chưa có trong tổ chức thì tiến hành thêm người dùng */
    try {
      await memberOrganizationRef.child(`${organizationId}`).set({
        ...dataMemeberInOrganization,
        [username]: true,
      })
      return res.status(200).json({ msg: "Thành công", code: 0 })
    } catch (error) {
      console.log("Xảy ra lỗi khi thêm người dùng vào tổ chức")
      return res
        .status(500)
        .json({ msg: "Xảy ra lỗi khi thêm người dùng vào tổ chức", code: 5 })
    }
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ msg: "Xảy ra lỗi khi xác minh token", code: 2 })
  }
}

export const requestJoinOrganization = async (req, res) => {
  const { organizationId } = req.body
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  let username
  try {
    const decoded = jwt.verify(token, process.env.KEY_JWT)
    username = decoded.username
  } catch (error) {
    console.log("Xảy ra lỗi khi xác minh token")
    return res
      .status(500)
      .json({ msg: "Xảy ra lỗi khi xác minh token", code: 2 })
  }
  /** Sau khi lấy ra được username thì tiến hành kiểm tra xem người dùng đã có trong tổ chức hay chưa */
  const memberOrganizationRef = admin.database().ref("memberOrganizations")
  const memberOrganizationsData = memberOrganizationRef.child(
    `${organizationId}`,
  )
  const snapshot = await memberOrganizationsData.once("value")
  const dataMemeberInOrganization = snapshot.val()
  /** Kiểm tra xem người dùng đã có trong tổ chức hay chưa */
  if (dataMemeberInOrganization[username]) {
    return res.status(403).json({
      msg: "Yêu cầu bị từ chối do người dùng đã tồn tại trong tổ chức",
      code: 4,
    })
  }
  /** Nếu chưa tham gia thì Kiểm tra xem người dùng đã gửi yêu cầu tham gia trước đó chưa */
  const check = await checkRequestOfUser(username, organizationId)
  if (check) {
    return res
      .status(400)
      .json({ msg: "Bạn đã gửi yêu cầu tham gia tổ chức này rồi", code: 5 })
  }
  /** Tạo ra một requestJoinOrganization */
  const requestJoinOrganizationRef = admin
    .database()
    .ref("requestJoinOrganizations")
  const newRequestRef = requestJoinOrganizationRef.push()
  const newRequestId = newRequestRef.key
  try {
    await newRequestRef.set({
      id: newRequestId,
      username: username,
      organizationId: organizationId,
      status: CHUA_XU_LY,
    })
    return res
      .status(200)
      .json({ msg: "Gửi yêu cầu tham gia tổ chức thành công", code: 0 })
  } catch (error) {
    console.log("Xảy ra lỗi khi thêm requestJoinOrganization")
    return res
      .status(500)
      .json({ msg: "Xảy ra lỗi khi thêm requestJoinOrganization", code: 3 })
  }
}

export const getOrganizationByCreator = async (req, res) => {
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  let username
  try {
    const decoded = await jwt.verify(token, process.env.KEY_JWT)
    username = decoded.username
  } catch (error) {
    console.log("Lỗi khi xác minh token")
    return res.status(500).json({ msg: "Lỗi khi xác minh token", code: 2 })
  }
  /** Sau khi lấy ra được user */
  const organizationsRef = admin.database().ref("organizations")
  try {
    const snapshot = await organizationsRef
      .orderByChild("creator")
      .equalTo(username)
      .once("value")
    if (!snapshot.val())
      return res.status(200).json({ msg: "Thành công", data: [], code: 0 })
    const listOrganizationId = Object.keys(snapshot.val())
    let data = []
    for (let i = 0; i < listOrganizationId.length; i++) {
      const _snapshot = await organizationsRef
        .child(`${listOrganizationId[i]}`)
        .once("value")
      data.push(_snapshot.val())
    }
    return res.status(200).json({ msg: "Thành công", data: data, code: 0 })
  } catch (error) {
    console.log("Lỗi khi thực hiện lấy các tổ chức mà người dùng tạo ra")
    return res.status(500).json({
      msg: "Lỗi khi thực hiện lấy các tổ chức mà người dùng tạo ra",
      code: 3,
    })
  }
}

export const handleRequestJoinOrganization = async (req, res) => {
  const { requestJoinOrganizationId, option } = req.body
  /** Lấy ra token được cung cấp */
  const token = req.header("Authorization")?.split(" ")[1]
  let username
  /** Lấy username */
  try {
    const decoded = await jwt.verify(token, process.env.KEY_JWT)
    username = decoded.username
  } catch (error) {
    console.log("Lỗi khi xác minh token")
    return res.status(500).json({ msg: "Lỗi khi xác minh token", code: 5 })
  }
  /** Lấy thông tin của requestJoinOrganization */
  const requestJoinOrganizationRef = admin
    .database()
    .ref("requestJoinOrganizations")
  const requestRef = requestJoinOrganizationRef.child(
    `${requestJoinOrganizationId}`,
  )
  const snapshotRequest = await requestRef.once("value")
  if (!snapshotRequest.exists())
    return res.status(404).json({ msg: "Id yêu cầu không tồn tại", code: 2 })
  const requestData = snapshotRequest.val()
  const userWantJoin = requestData.username
  const organizationWantJoin = requestData.organizationId
  /** Kiểm tra xem organizationWantJoin có tồn tại hay không */
  const organizationRef = admin.database().ref("organizations")
  const snapshotOrganization = await organizationRef
    .child(`${organizationWantJoin}`)
    .once("value")
  if (!snapshotOrganization.exists())
    return res.status(404).json({ msg: "Id tổ chức không tồn tại", code: 3 })
  /** Kiểm tra xem userWantJoin có tồn tại hay không */
  const userRef = admin.database().ref("users")
  const snapshotUser = await userRef.child(`${userWantJoin}`).once("value")
  if (!snapshotUser.exists())
    return res
      .status(404)
      .json({ msg: "Người dùng yêu cầu không tồn tại", code: 4 })
  /** Kiểm tra quyền thực hiện của người dùng */
  if (username !== snapshotOrganization.val().creator)
    return res.json({
      msg: "Không có quyền thực hiện xử lý yêu cầu đăng ký",
      code: 6,
    })
  if (option === TU_CHOI) {
    admin
      .database()
      .ref(`requestJoinOrganizations/${requestJoinOrganizationId}`)
      .remove()
      .then(() => {
        console.log("Đã từ chối yêu cầu tham gia tổ chức")
        res
          .status(200)
          .json({ msg: "Đã từ chối yêu cầu tham gia tổ chức", code: 0 })
      })
      .catch(() => {
        console.log("Lỗi khi từ chối yêu cầu")
        res.status(500).json({ msg: "Lỗi khi từ chối yêu cầu", code: 7 })
      })
    return
  }
  if (option === DONG_Y) {
    /** Lấy ra thông tin thành viên hiện tại của tổ chức */
    const snapshotMemberOrganization = await admin
      .database()
      .ref("memberOrganizations")
      .child(`${organizationWantJoin}`)
      .once("value")
    const dataSnapshotMemberOrganization = snapshotMemberOrganization.val()
    /** Thêm thành viên mới */
    await admin
      .database()
      .ref("memberOrganizations")
      .child(`${organizationWantJoin}`)
      .set({
        ...dataSnapshotMemberOrganization,
        [userWantJoin]: true,
      })
    /** Xóa requestJoinOrganization */
    admin
      .database()
      .ref(`requestJoinOrganizations/${requestJoinOrganizationId}`)
      .remove()
      .then(() => {
        console.log("Đã đồng ý yêu cầu tham gia tổ chức")
        res
          .status(200)
          .json({ msg: "Đã đồng ý yêu cầu tham gia tổ chức", code: 0 })
      })
      .catch(() => {
        console.log("Lỗi khi từ chối yêu cầu")
        res.status(500).json({ msg: "Lỗi khi đồng ý yêu cầu", code: 8 })
      })
    return
  }
}
