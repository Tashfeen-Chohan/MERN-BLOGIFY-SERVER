const router = require("express").Router()
const userControllers = require("../controllers/userControllers")

router.route("/")
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser)

router.route("/:id")  
  .get()
  .patch()
  .delete()

module.exports = router;  