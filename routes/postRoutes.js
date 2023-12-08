const router = require("express").Router()
const postControllers = require("../controllers/postControllers")

router.route("/")
  .get(postControllers.getAllPosts)
  .post(postControllers.createPost)

router.route("/:id")  
  .get(postControllers.getSinglePost)
  .patch(postControllers.updatePost)
  .delete(postControllers.deletePost)
  
module.exports = router;  