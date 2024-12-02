const Book = require("../models/Book");
const User = require("../models/userModel");
const Author = require("../models/author");
const Product = require("../models/product");
const Redis = require("ioredis");
const redisClient = new Redis();

const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");

// register user
async function registerUser(req, res) {
  const { name, email, password, number } = req.body;

  // check user email
  const isEmailExisting = await User.findOne({ email });

  if (isEmailExisting) {
    return res.status(400).json({ error: "Email already exists" });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = new User({ name, email, password: hashedPassword, number });
  await user.save();

  // generate token
  const token = await generateToken(user);

  redisClient.get("users", (err, cachedUser) => {
    if (err) throw err;
    let userArr = [];
    if (cachedUser) {
      userArr = JSON.parse(cachedUser);
      userArr.push(user);
    }
    redisClient.setex("users", 120, JSON.stringify(userArr));
  });
  return res.status(200).json({
    status: 200,
    message: "user register successfully",
    token: token,
    data: user,
  });
}

// login user
async function loginUser(req, res) {
  const { email, password } = req.body;

  console.log("body", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  const isExistUser = await User.findOne({ email: email });

  if (isExistUser) {
    const isPasswordMatch = bcrypt.compare(password, isExistUser.password);

    if (isPasswordMatch) {
      const token = await generateToken(isExistUser);

      // find product
      const products = await Product.find({ userId: isExistUser._id });

      redisClient.setex(
        `user:${isExistUser._id}:products`,
        3600,
        JSON.stringify(products)
      );

      return res.status(200).json({ status: 200, data: token });
    } else {
      return res
        .status(400)
        .json({ status: 404, message: "Invalid Credentials" });
    }
  } else {
    return res
      .status(400)
      .json({ status: 404, message: "Invalid Credentials" });
  }
}

// show user
async function showUsers(req, res) {
  redisClient.get("users", async (err, cachedUsers) => {
    if (err) throw err;
    if (cachedUsers && cachedUsers.length > 0) {
      return res
        .status(200)
        .json({
          status: 200,
          message: "Users fetched from Cached",
          data: JSON.parse(cachedUsers),
        });
    } else {
      const users = await User.find({});
      redisClient.setex("users", 120, JSON.stringify(users));
      return res
        .status(200)
        .json({
          status: 200,
          message: "Users fetched from Database",
          data: users,
        });
    }
  });
}

module.exports = {
  registerUser,
  loginUser,
  showUsers,
};
