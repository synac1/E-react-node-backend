
module.exports = (sequelize, Sequelize) => {
    const DoctorAppointmentRequest = sequelize.define("DoctorAppointmentRequest", {
      Patient: {
        type: Sequelize.INTEGER,
        field: 'patient',
      },
      TimeSegment:{
        type: Sequelize.INTEGER,
        field: 'time_segment',
      },
      Status:{
        type: Sequelize.INTEGER,
        field: 'status',
      },
      Description:{
        type: Sequelize.TEXT,
        field: 'description',
      },
    },{
        tableName: 'doctor_appointment_requests',
        timestamps: false,
    });
    return DoctorAppointmentRequest;
  };
  