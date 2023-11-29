module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define(
    "DoctorTaskSystems",
    {
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
      appointmentTime: {
        type: Sequelize.DATE,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeCreate: (task) => {
          // 在创建记录之前，检查是否已设置了 appointmentTime
          // 如果没有设置，将其设置为当前日期和时间
          if (!task.appointmentTime) {
            task.appointmentTime = new Date();
          }
        },
      },
    }
  );

  return Task;
};
