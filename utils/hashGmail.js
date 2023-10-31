const hashGmail = (email) => {
  return email.replace(/[.#$[\]]/g, "_")
}

export default hashGmail
