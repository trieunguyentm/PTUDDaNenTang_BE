import { Router } from "express"
import multer from "multer"
import * as organizationMiddleware from "../middlewares/organizationMiddleware.js"
import * as organizationController from "../controllers/organizationController.js"

const organizationRouter = Router()
// Cấu hình Multer để xử lý tải lên tệp
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

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
export default organizationRouter
