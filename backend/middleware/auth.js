const { verifyToken } = require('../utils/jwt');

const auth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('No token provided');
    }

    // 2. Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Invalid token format');
    }

    // 3. Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    // 4. Add userId to request object
    req.userId = decoded.userId;
    
    // 5. Move to next middleware/route
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      success: false,
      error: 'Authentication required. Please login.' 
    });
  }
};

module.exports = auth;