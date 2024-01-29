const jwt = require("jsonwebtoken");

const verifyJWT = async (req, res, next) => {

  const authHeader = req.headers.Authorization || req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  
  const token = authHeader.split(' ')[1]

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    // ATTACH THE DECODED USER INFORMATION TO THE REQ OBJECT FOR LATER USE
    req.user = decoded.UserInfo;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized: Invalid Token!" });
  }
};

module.exports = verifyJWT;
