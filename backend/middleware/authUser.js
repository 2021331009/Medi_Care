import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login again.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id }; // Attach user ID to request object
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

export default authUser;
