// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import { verifyToken } from "./auth";

/**
 * The main purpose of this function is to guarantee the API routes can only be accessed by authenticated users. 
 * The header of the request has to be Bearer <token>
 * The the handler(req, res) helps us to call the actual API route handler.
 * **/
export function authMiddleware(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach the decoded user data to the request
    req.user = decoded;

    // Call the actual handler
    return handler(req, res);
  };
}
