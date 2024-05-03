const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  changeUserDetails,
  getAllUsers,
  getSingleUserDetails,
  updateUserRole,
  deleteUser,
} = require("../controller/userController");
const { isAuthenticated, authorizedAccess } = require("../middleware/auth");

// sign up user
router.route("/newuser").post(signupUser);
//login user
router.route("/login").post(loginUser);
//logout user
router.route("/logout").get(logoutUser);
//forgotPassword
router.route("/password/reset").post(forgotPassword);
//resetpassword
router.route("/password/reset/:token").put(resetPassword);
//get user details
router.route("/mydetails").get(isAuthenticated, getUserDetails);
//update password
router.route("/changepassword").put(isAuthenticated, updatePassword);
//update user details
router.route("/changemydetails").put(isAuthenticated, changeUserDetails);
//ADMIN get all users
router
  .route("/admin/allusers")
  .get(isAuthenticated, authorizedAccess("admin"), getAllUsers);
//ADMIN get details of a single user
router
  .route("/admin/userdetails/:id")
  .get(isAuthenticated, authorizedAccess("admin"), getSingleUserDetails)
  .put(isAuthenticated, authorizedAccess("admin"), updateUserRole)
  .delete(isAuthenticated, authorizedAccess("admin"), deleteUser);
module.exports = router;
