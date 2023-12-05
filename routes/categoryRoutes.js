const router = require("express").Router()
const categoryControllers = require("../controllers/categoryControllers")

router.route("/")
  .get(categoryControllers.getAllCategories)
  .post(categoryControllers.createCategory)

router.route("/:id")  
  .patch()
  .delete()

module.exports = router;  