const router = require("express").Router();
const {
  getAllUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  totalUsers,
} = require("../controllers/userControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles");

const checkAdmin = checkRoles(["Admin"]);
const checkPublisher = checkRoles(["Publisher"]);

router.route("/")
  .get (getAllUsers)
  .post (createUser)
  .patch(verifyJWT, changePassword)
  
router.route("/total-users")
  .get(totalUsers)
  
router
  .route("/:id")
  .get(getSingleUser)
  .patch (verifyJWT, updateUser)
  // .patch(updateUser)
  .delete (verifyJWT, checkAdmin, deleteUser);
  // .delete(deleteUser)

module.exports = router;
