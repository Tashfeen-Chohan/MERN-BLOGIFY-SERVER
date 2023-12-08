const router = require("express").Router()
const postControllers = require("../controllers/postControllers")

router.route("/")
  .get()
  .post(postControllers.createPost)

router.route("/:id")  
  .get()
  .patch()
  .delete()
  
module.exports = router;  