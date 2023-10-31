
const dbConfig = require("../config/db.config");
const db = require("../../db");
const { QueryTypes } = require("sequelize");
const Task = db.Task;


// Find all task, good
exports.getAllTasks = (req, res) => {
  Task.findAll()
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
  //const { idd } = req.params.id;
  //print idd
  //console.log(typeof(req.params));
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
  };

  // Save task in the database
  Task.create(task)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(400).send({
        message: `Some error occurred while creating the Task.`,
      });
    });
};



// Update task
exports.updateTask = (req, res) => {
  //const { id } = req.params;
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
  //const { FName, MName, LName, Age } = req.params;

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


/*module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("task", {
    DoctorName: {
      type: Sequelize.STRING,
    },
    FName: {
      type: Sequelize.STRING,
    },
    MName: {
      type: Sequelize.STRING,
    },
    LName: {
      type: Sequelize.STRING,
    },
    Age: {
      type: Sequelize.INTEGER,
    },
    Plan: {
      type: Sequelize.STRING,
    },
  });
  return Task;
};


1. All tasks: Find all task
2. Query tasks: Query all task containing FName
3. Create a new task
4. Update task
5. Delete task
*/