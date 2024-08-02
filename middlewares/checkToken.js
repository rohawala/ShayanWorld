import jwt from 'jsonwebtoken'
export function extractToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.trim().length === 0) {
        return res.status(401).json({ message: 'No token provided' });
      }
      req.token = token.replace("Bearer ","");
      next();
    } else {
      req.token = null;
      res.status(401).json({ message: 'No token provided' });
    }
}

export async function Verify_Token(req, res, next) {
    try {
      // console.log(req.token);

        if (!req.token) {
            return res.status(401).json({ message: 'Token not provided' });
        }
        const decoded = await jwt.verify(req.token, process.env.SECRETKEY);
        console.log(decoded);
        req.decoded = decoded;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(403).json({ message: 'Failed to authenticate token' });
    }
}

  