const User = require("../models/user");

// function to findOrCreateUser as mongooseJS does not have on built in
findOrCreateUser = async (userObj) => {
  try {
    let user = await User.findOne({ googleId: userObj.googleId });

    if (!user) {
      // If the user doesn't exist, create a new one
      user = await User.create({
        googleId: userObj.googleId,
        username: userObj.username,
        email: userObj.email,
        pfp: userObj.pfp,
      });
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = findOrCreateUser;
