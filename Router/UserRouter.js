import express from "express";
const router = express.Router();

import {
  registerUser,
  login,
  setAvatar,
  getAllUsers,
  logOut,
} from "../Controller/UserController.js";

import { addMessage, getMessages } from "../Controller/UserController.js";

// create-register
router.post("/register", registerUser);
// Login User
router.post("/login", login);
// Setavatar
router.post("/setavatar/:id", setAvatar);
// getUser
router.get("/allusers/:id", getAllUsers);
// Logout
router.get("/logout/:id", logOut);
// ---------------

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
export default router;
