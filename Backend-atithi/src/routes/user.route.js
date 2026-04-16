const express = require("express");
const router = express.Router();

const {
  createUserController,
  getUsersController,
  getUserProfileController,
  updateUserProfileController
} = require("../controllers/user.controller");

router.post("/create", createUserController);
router.get("/all", getUsersController);
router.get("/profile/:id", getUserProfileController);
router.put("/profile/:id", updateUserProfileController);

module.exports = router;