const router = require("express").Router();
const {
  getAllPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  viewPost,
  unlikePost,
} = require("../controllers/postControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles")

const checkAdmin = checkRoles(["Publisher", "Admin"])
const checkPublisher = checkRoles(["Publisher"])


router
  .route("/")
  .get(getAllPosts)
  .post(verifyJWT, checkPublisher, createPost);


router
  .route("/:id")
  .get(getSinglePost)
  .patch(verifyJWT, checkPublisher, updatePost)
  .delete(verifyJWT, checkPublisher, deletePost);

router
  .route("/:id/like")
  .patch(verifyJWT, likePost)
  
router
  .route("/:id/unlike")
  .patch(verifyJWT, unlikePost)  
  
router
  .route("/:id/view")
  .patch(viewPost)  

module.exports = router;
