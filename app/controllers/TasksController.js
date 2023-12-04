
const dbConfig = require("../config/db.config");
const db = require("../../db");
const Task = db.Task;
const { Op, QueryTypes } = require("sequelize");


// Find all task, good
exports.getAllTasks = (req, res) => {
  const { filter } = req.query;
  let whereCondition = {};

  // Add condition based on the filter option
  if (filter === 'today') {
    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    whereCondition = {
      appointmentTime: {
        [Op.gte]: oneDayAgo,
      },
    };
  }
  else if (filter === 'week') {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    whereCondition = {
      appointmentTime: {
        [Op.gte]: oneWeekAgo,
      },
    };
  }

  Task.findAll({
    where: whereCondition, // Include the where condition here
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send({
        message: err.message || `Some error occurred while retrieving tasks.`,
      });
    });
};


// Query specific task, good
exports.getTaskByPatientDetails = (req, res) => {
  Task.findOne({ 
    where: { 
      id: req.params.id,
     }
   })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send({
        message: `Error retrieving Tasks with the given details.`,
      });
    });
};

// Create a new task,good
exports.createTask = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.FName) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a task then save it in the database
  const task = {
    DoctorName: req.body.DoctorName,
    FName: req.body.FName,
    MName: req.body.MName,
    LName: req.body.LName,
    Age: req.body.Age,
    Plan: req.body.Plan,
    appointmentTime: req.body.appointmentTime,
  };

  // Save task in the database
  Task.create(task)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send({
        message: `Some error occurred while creating the Task.`,
      });
    });
};

// Update task
exports.updateTask = (req, res) => {
  Task.update(req.body,{ where: { 
    id: req.params.id,
    } })
    .then((result) => {
      if (result.nModified > 0) {
        res.send({
          message: `${result.nModified} task(s) were updated successfully.`,
        });
      } else {
        res.send({
          message: `!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: `Error updating task`,
      });
    });
};

// Delete task,good
exports.deleteTask = (req, res) => {
  Task.destroy({ where: { 
    id: req.params.id,
   } })
    .then((data) => {
      if (data) {
        res.send({
          message: `Task was deleted successfully!`,
        });
      } else {
        res.send({
          message: `Cannot delete Task with FName=${FName}, MName=${MName}, LName=${LName}, and Age=${Age}. Maybe Task was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(400).send({
        message: `Could not delete Task with FName=${FName}, MName=${MName}, LName=${LName}, and Age=${Age}`,
      });
    });
};

