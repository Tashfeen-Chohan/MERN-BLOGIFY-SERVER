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

const checkAdmin = checkRoles(["Publisher", "Admin"]);
const checkPublisher = checkRoles(["Publisher"]);

router.route("/")
  .get (getAllUsers)
  .post (verifyJWT, checkAdmin, createUser);

router
  .route("/:id")
  .get (getSingleUser)
  .patch (verifyJWT, updateUser)
  .delete (verifyJWT, checkAdmin, deleteUser);

module.exports = router;
