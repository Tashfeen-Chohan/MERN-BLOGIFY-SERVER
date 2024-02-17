const router = require("express").Router()

const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles");
const { getAllComments, getPostComments, createComment, likeComment, editComment, deleteComment } = require("../controllers/commentControllers");

const checkAdmin = checkRoles(["Admin", "Publisher"])

// GET ALL COMMENT
router.get("/", verifyJWT, checkAdmin, getAllComments)
// GET POST COMMENT
router.get("/getPostComments/:postId",  getPostComments)
// CREATE COMMENT
router.post("/create", verifyJWT, createComment)
// LIKE COMMENT 
router.patch("/likeComment/:commentId", verifyJWT, likeComment)
// EDIT COMMENT
router.patch("/editComment/:commentId", verifyJWT, editComment)
// DELETE COMMENT
router.delete("/deleteComment/:commentId", verifyJWT, deleteComment)

module.exports = router;