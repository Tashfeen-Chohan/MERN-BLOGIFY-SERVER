const router = require("express").Router()
const authControllers = require("../controllers/authControllers")

router.route("/login")
  .post(authControllers.login)

router.route("/logout")  
  .post()

module.exports = router;  