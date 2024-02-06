exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect(process.env.CLIENT_URL);
};

exports.user_info = (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
