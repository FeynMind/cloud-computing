export const protectedRouteHandler = (req, res) => {
    return res.status(200).json({
      status: 200,
      message: 'This is a protected route, user is authenticated.',
      user: req.user,  // `req.user` di-set oleh verifyToken
    });
  };
  