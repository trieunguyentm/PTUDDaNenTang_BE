import { Router } from "express"
import multer from "multer"
import * as organizationMiddleware from "../middlewares/organizationMiddleware.js"
import * as organizationController from "../controllers/organizationController.js"

const organizationRouter = Router()
// Cấu hình Multer để xử lý tải lên tệp
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const upload_image = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false)
    }
  },
})

/** POST http://localhost:8080/api/organization/create */
organizationRouter.post(
  "/create",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkCreateOrganization,
  organizationController.createOrganization,
)

/** POST http://localhost:8080/api/organization/uploadAvatar/:organizationId */
organizationRouter.post(
  "/uploadAvatar/:organizationId",
  upload.single("file"),
  organizationMiddleware.checkUploadAvatar,
  organizationController.uploadAvatarOrganization,
)

/** GET http://localhost:8080/api/organization/getOrganizationByUser */
organizationRouter.get(
  "/getOrganizationByUser",
  organizationMiddleware.checkExistToken,
  organizationController.getOrganizationByUser,
)

/** GET http://localhost:8080/api/organization/getAllOrganization */
organizationRouter.get(
  "/getAllOrganization",
  organizationController.getAllOrganization,
)

/** POST http://localhost:8080/api/organization/addUserToOrganization */
organizationRouter.post(
  "/addUserToOrganization",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkAddUserToOrganization,
  organizationMiddleware.checkExistUser,
  organizationMiddleware.checkExistOrganization,
  organizationController.addUserToOrganization,
)

/** POST http://localhost:8080/api/organization/requestJoinOrganization */
organizationRouter.post(
  "/requestJoinOrganization",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkRequestJoinOrganization,
  organizationMiddleware.checkExistOrganization,
  organizationController.requestJoinOrganization,
)

/** GET http://localhost:8080/api/organization/getOrganizationByCreator */
organizationRouter.get(
  "/getOrganizationByCreator",
  organizationMiddleware.checkExistToken,
  organizationController.getOrganizationByCreator,
)

/** POST http://localhost:8080/api/organization/handleRequestJoinOrganization */
organizationRouter.post(
  "/handleRequestJoinOrganization",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkHandleRequestJoinOrganization,
  organizationController.handleRequestJoinOrganization,
)

/** POST http://localhost:8080/api/organization/getRequestJoinOrganization */
organizationRouter.post(
  "/getRequestJoinOrganization",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkExistOrganization,
  organizationController.getRequestJoinOrganization,
)

/** GET http://localhost:8080/api/organization/getUserInOrganization/:organizationId */
organizationRouter.get(
  "/getUserInOrganization/:organizationId",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkExistOrganizationParams,
  organizationController.getUserInOrganization,
)

/** POST http://localhost:8080/api/organization/checkUserJoinOrganization */
organizationRouter.post(
  "/checkUserJoinOrganization",
  organizationMiddleware.checkExistUser,
  organizationMiddleware.checkExistOrganization,
  organizationController.checkUserJoinOrganization,
)

/** PUT http://localhost:8080/api/organization/updateOrganization/:organizationId */
organizationRouter.put(
  "/updateOrganization/:organizationId",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkExistOrganizationParams,
  organizationMiddleware.checkUpdateOrganization,
  organizationController.updateInfoOrganization,
)

/** POST http://localhost:8080/api/organization/createPostInOrganization */
organizationRouter.post(
  "/createPostInOrganization",
  upload_image.array("images", 10),
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkCreatePostInOrganization,
  organizationMiddleware.checkExistOrganization,
  organizationController.createPostInOrganization,
)

/** GET http://localhost:8080/api/organization/getRequestJoinOrganizationByUser */
organizationRouter.get(
  "/getRequestJoinOrganizationByUser",
  organizationMiddleware.checkExistToken,
  organizationController.getRequestJoinOrganizationByUser,
)

/** GET http://localhost:8080/api/organization/getPostInOrganization/:organizationId */
organizationRouter.get(
  "/getPostInOrganization/:organizationId",
  organizationMiddleware.checkExistToken,
  organizationMiddleware.checkExistOrganizationParams,
  organizationController.getPostInOrganization,
)

export default organizationRouter
