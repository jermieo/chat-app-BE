import bcrypt from "bcrypt";
import UserSchema from "../Models/UserModel.js";
import Messagesdata from "../Models/MessageModel.js";
import dotenv from "dotenv";
dotenv.config();

// Get Message
export const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await Messagesdata.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (error) {
    res.json({
      error: "Message failed , Message internal error",
      status: false,
    });
  }
};

// Add message
export const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messagesdata.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (error) {
    res.json({
      error: "Message failed , Message internal error",
      status: false,
    });
  }
};

//Create Registration
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await UserSchema.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await UserSchema.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ user, msg: "User Created", status: true });
  } catch (error) {
    res.json({
      msg: "Register failed , Registration internal error",
      status: false,
    });
  }
};

// Login User
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await UserSchema.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    res.json({ error: "Login failed , Login internal error", status: false });
  }
};

//SetAvatar

export const setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await UserSchema.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    res.json({
      error: "setAvatar failed , setAvatar internal error",
      status: false,
    });
  }
};

// getAllUsers
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserSchema.find({ _id: { $ne: req.params.id } }).select(
      ["email", "username", "avatarImage", "_id"]
    );
    return res.json(users);
  } catch (error) {
    res.json({
      error: "getAllUsers failed , getAllUsers internal error",
      status: false,
    });
  }
};

// Logout
export const logOut = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.json({ msg: "User id is  required " });
    }
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (error) {
    res.json({
      error: "Logout failed , Logout internal  error",
      status: false,
    });
  }
};
