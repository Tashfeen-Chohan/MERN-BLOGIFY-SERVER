const router = require("express").Router();
const {
  getAllUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles");

const checkAdmin = checkRoles(["Admin"]);
const checkPublisher = checkRoles(["Publisher"]);

router.route("/")
  .get (getAllUsers)
  .post (verifyJWT, checkAdmin, createUser);
  // .post(createUser)

router
  .route("/:id")
  .get (verifyJWT, getSingleUser)
  // .get(getSingleUser)
  .patch (verifyJWT, updateUser)
  // .patch(updateUser)
  .delete (verifyJWT, checkAdmin, deleteUser);
  // .delete(deleteUser)

module.exports = router;
