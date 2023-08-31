// app/controllers/userController.js
// const sequelize = require("../../db");
// const User = sequelize.User;

const db = require("../../db");
const User = db.User;



// exports.getAllUsers = (req, res) => {
//   // Implement logic to fetch all users from the database

// };

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = await User.create({
      username,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// exports.createUser = (req, res) => {
//   // Implement logic to create a new user in the database
// };

exports.getUserById = (req, res) => {
  // Implement logic to fetch a user by ID from the database
};

exports.updateUser = (req, res) => {
  // Implement logic to update a user by ID in the database
};

// exports.deleteUser = (req, res) => {
//   // Implement logic to delete a user by ID from the database
// };

