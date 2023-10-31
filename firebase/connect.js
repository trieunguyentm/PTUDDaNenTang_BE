import admin from "firebase-admin"
import serviceAccount from "../serviceAccountKey.json" assert { type: "json" }

/** Khởi tạo ứng dụng Firebase */
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://volunteerapp-e7f94-default-rtdb.asia-southeast1.firebasedatabase.app/",
  })
  console.log(">>> Connect firebase successfully")
} catch (error) {
  console.log(">>> Failed when connect firebase")
  console.log(">>> Error:", error)
}

/** Xuất đối tượng admin để sử dụng trong các tệp khác */
export default admin
