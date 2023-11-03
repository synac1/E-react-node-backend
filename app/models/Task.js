module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("DoctorTaskSystems", {
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
  }, {
    timestamps: false // 禁用 createdAt 和 updatedAt 字段
  });

  return Task;
};
