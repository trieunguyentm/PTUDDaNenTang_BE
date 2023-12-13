import admin from "./connect.js"

const helpRequestRef = admin.database().ref("helpRequests")

export const getAllHelpRequestService = async () => {
  const helpRequestData = await (await helpRequestRef.once("value")).val()

  const listHelpRequestId = Object.keys(helpRequestData)
  let data = []
  for (let i = 0; i < listHelpRequestId.length; i++) {
    const dataRes = (
      await helpRequestRef.child(`${listHelpRequestId[i]}`).once("value")
    ).val()
    data.push(dataRes)
  }
  return data
}
