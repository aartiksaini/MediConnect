// auth.js
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, 'ankit'); // Replace 'ankit' with process.env.JWT_SECRET in production
    req.patient = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth; // Use export default for ES module
