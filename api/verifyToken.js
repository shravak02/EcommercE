import jwt from 'jsonwebtoken';

export const verifyToken = (req) => {
  const authHeader = req.headers.token;

  if (!authHeader) {
    return { error: 'Authentication token missing', status: 401 };
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, process.env.JWT_SEC);
    return { user };
  } catch (err) {
    return { error: 'Invalid token', status: 403 };
  }
};

export const verifyTokenAndAuthorization = (req, userIdParam) => {
  const { user, error, status } = verifyToken(req);
  if (error) return { error, status };

  if (user.id === userIdParam || user.isAdmin) {
    return { user };
  } else {
    return { error: 'Not authorized', status: 403 };
  }
};

export const verifyTokenAndAdmin = (req) => {
  const { user, error, status } = verifyToken(req);
  if (error) return { error, status };

  if (user.isAdmin) {
    return { user };
  } else {
    return { error: 'Admin access required', status: 403 };
  }
};
