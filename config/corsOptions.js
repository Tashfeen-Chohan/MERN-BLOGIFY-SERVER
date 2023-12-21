const allowedOrigins = require("./allowedOrigins")

const corsOptions = {
  origin: (origin, callback) => {
    // IF INCOMMING REQUEST IS FROM ALLOWED ORIGINS OR REST TOOLS [POSTMON] OR SERVER TO SERVER
    if (allowedOrigins.indexOf(origin) !== -1 || !origin){
      // ERROR, BOOLEAN
      callback(null, true)
    } else {
      callback(new Error("Not allowed by the CORS"))
    }
  },
  credentials: true,
}

module.exports = corsOptions;