const router = require("express").Router()
const userControllers = require("../controllers/userControllers")

router.route("/")
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser)

router.route("/:id")  
  .get(userControllers.getSingleUser)
  .patch()
  .delete(userControllers.deleteUser)

module.exports = router;  