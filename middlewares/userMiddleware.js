export const checkExistToken = (req, res, next) => {
  const authHeader = req.header("Authorization")
  if (!authHeader) {
    return res
      .status(400)
      .json({ msg: "Chưa cung cấp Authorization Bearer Token" })
  }
  if (authHeader) {
    const token = authHeader?.split(" ")[1]
    if (!token) return res.status(400).json({ msg: "Chưa cung cấp Token" })
  }
  next()
}

export const checkDataUpdate = (req, res, next) => {
  const dataUpdate = req.body
  const allowedFields = ["displayName", "phone", "gender"]
  for (const key in dataUpdate) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        msg: `Trường "${key}" không hợp lệ`,
      })
    }
  }
  next()
}
