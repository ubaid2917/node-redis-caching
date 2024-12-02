const jwt = require("jsonwebtoken");

// generate tokem
async function generateToken(user) {
  try {
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
    return token;
  } catch (err) {
    console.error(err);
    return "Error generating token";
  }
}

// verify token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];

  //   console.log('token', token);
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}
module.exports = {
  generateToken,
  verifyToken,
};
