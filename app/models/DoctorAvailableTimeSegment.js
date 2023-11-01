
module.exports = (sequelize, Sequelize) => {
    const DoctorAvailableTimeSegment = sequelize.define("DoctorAvailableTimeSegment", {
      Doctor: {
        type: Sequelize.INTEGER,
        field: 'doctor',
      },
      Status: {
        type: Sequelize.INTEGER,
        field: 'status',
      },
      Start:{
        type: Sequelize.DATE,
        field: 'start',
      },
      End:{
        type: Sequelize.DATE,
        field: 'end',
      },
      Description:{
        type: Sequelize.TEXT,
        field: 'description',
      },
    },{
        tableName: 'doctor_available_time_segments',
        timestamps: false,
    });
    return DoctorAvailableTimeSegment;
  };
  