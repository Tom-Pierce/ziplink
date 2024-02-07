const User = require("../models/user");

// function to findOrCreateUser as mongooseJS does not have on built in
findOrCreateUser = async (userObj) => {
  try {
    let user = await User.findOne({ email: userObj.email });

    if (!user) {
      // If the user doesn't exist, create a new one
      user = await User.create({
        email: userObj.email,
        pfp: userObj.pfp ? userObj.pfp : undefined,
      });
    }

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = findOrCreateUser;
