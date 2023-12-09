const jwt = require("jsonwebtoken")

const verifyJWT = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).send({message: "Unauthorized: No token provided!"})

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY)
    // ATTACK THE DECODED USER INFORMATION TO THE REQ OBJECT FOR LATER USE
    req.user = decoded.UserInfo
    next()
  } catch (error) {
    return res.status(401).send({message: "Unauthorized: Invalid Token!"})
  }
}

module.exports = verifyJWT;