
module.exports = (sequelize, Sequelize) => {
    const PatientsRegistration = sequelize.define("doctors_registration", {
      FName: {
        type: Sequelize.STRING,
      },
      MName: {
        type: Sequelize.STRING,
      },
      LName: {
        type: Sequelize.STRING,
      },
      // Define other fields here
    });
    return PatientsRegistration;
  };
  