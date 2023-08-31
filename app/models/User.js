// app/models/User.js
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      }
      // Add other fields here
    });
  
    return User;
  };
  