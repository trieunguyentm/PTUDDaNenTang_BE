import admin from "./connect.js"

/** Tham chiếu đến nút organizations */
const organizationRef = admin.database().ref("organizations")
/** Tham chiếu đến nút members */
const memberOrganizationRef = admin.database().ref("memberOrganizations")

/** Thêm organization mới vào db */
export const createNewOrganization = async (
  infoCreateOrganization,
  username,
) => {
  try {
    const newOrganizationRef = organizationRef.push()
    const newOrganizationRefId = newOrganizationRef.key
    await newOrganizationRef.set({
      ...infoCreateOrganization,
      id: newOrganizationRefId,
    })
    await memberOrganizationRef.child(`${newOrganizationRefId}`).set({
      [username]: true,
    })
    return {
      ...infoCreateOrganization,
      id: newOrganizationRefId,
    }
  } catch (error) {
    console.log("Lỗi xảy ra khi thêm tổ chức vào database")
    console.log(error)
    return {}
  }
}

/** Lấy thông tin tổ chức dựa trên id */
export const getOrganization = async (organizationId) => {
  try {
    const orgRef = organizationRef.child(`${organizationId}`)
    const snapshot = await orgRef.once("value")
    const orgData = snapshot.val()
    if (orgData) {
      return orgData
    } else {
      console.log(`Tổ chức ${organizationId} không tồn tại`)
      return {}
    }
  } catch (error) {
    console.log(`Lỗi khi tìm kiếm thông tin tổ chức: ${organizationId}`)
    console.log(error)
    return {}
  }
}

/** Cập nhật thông tin tổ chức */
export const updateOrganization = async (
  organizationId,
  updatedOrganization,
) => {
  try {
    await organizationRef.child(`${organizationId}`).update(updatedOrganization)
  } catch (error) {
    console.log("Lỗi xảy ra khi cập nhật thông tin tổ chức")
    console.log(error)
  }
}
