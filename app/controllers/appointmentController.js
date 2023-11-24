const db = require("../../db");
const { Op, QueryTypes } = require("sequelize");

const getDoctor = async (id) => {
  const result = await db.sequelize.query("SELECT id, Fname FROM doctors_registration WHERE id=:id", {
    replacements: { id },
    type: QueryTypes.SELECT,
  });
  return { id: result[0].id, name: result[0].Fname };
};

const getPatient = async (id) => {
  const result = await db.sequelize.query("SELECT id, FName FROM patients_registration WHERE id=:id", {
    replacements: { id },
    type: QueryTypes.SELECT,
  });
  return { id: result[0].id, name: result[0].FName };
};

exports.doctorGetCalendar = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const timesegments = await db.DoctorAvailableTimeSegment.findAll({
      where: {
        Doctor: loginData.id,
        Start: { [Op.lte]: end },
        End: { [Op.gte]: start },
      },
    });

    res.json({ status: 'OK', result: await Promise.all(timesegments.map(async (record) => ({
      id: record.id,
      doctor: await getDoctor(record.Doctor),
      status: record.Status,
      start: record.Start,
      end: record.End,
      description: record.Description,
    })))});
  } catch (error) {
    console.error("Error doctorGetCalendar:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientGetCalendar = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const result = await db.sequelize.query("SELECT *, (SELECT status FROM doctor_appointment_requests as t2 WHERE t2.patient = :patient_id AND t2.time_segment = t1.id) AS appointment_status FROM doctor_available_time_segments as t1 WHERE t1.start <= :end AND t1.end >= :start AND EXISTS (SELECT id FROM doctor_appointment_requests as t2 WHERE t2.patient = :patient_id AND t2.time_segment = t1.id)", {
      replacements: { start, end, patient_id: loginData.id },
      type: QueryTypes.SELECT,
    });

    res.json({ status: 'OK', result: await Promise.all(result.map(async (record) => ({
      id: record.id,
      doctor: await getDoctor(record.doctor),
      status: record.status,
      appointmentStatus: record.appointment_status,
      start: record.start,
      end: record.end,
      description: record.description,
    })))});
  } catch (error) {
    console.error("Error patientGetCalendar:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.getTimeSegmentDetail = async (req, res) => {
  try {
    const { loginData, id } = req.body;
    const timeSegment = await db.DoctorAvailableTimeSegment.findOne({
      where: { id },
    });
    const requests = await db.DoctorAppointmentRequest.findAll({
      where: {
        TimeSegment: timeSegment.id,
      },
    });

    res.json({ status: 'OK', result: {
      id: timeSegment.id,
      doctor: await getDoctor(timeSegment.Doctor),
      status: timeSegment.Status,
      start: timeSegment.Start,
      end: timeSegment.End,
      description: timeSegment.Description,
      requests: await Promise.all(requests.map(async (record) => ({
        id: record.id,
        patient: await getPatient(record.Patient),
        timeSegment: record.TimeSegment,
        status: record.Status,
        description: record.Description,
      }))),
    }});
  } catch (error) {
    console.error("Error getTimeSegmentDetail:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.doctorCreateAvailableTimeSegment = async (req, res) => {
  try {
    const { loginData, start, end, description } = req.body;
    const timesegment = db.DoctorAvailableTimeSegment.build({
      Doctor: loginData.id,
      Status: 0,
      Start: start,
      End: end,
      Description: description,
    });

    await timesegment.save();
    res.json({ status: 'OK', result: timesegment.id });
  } catch (error) {
    console.error("Error doctorCreateAvailableTimeSegment:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};


exports.doctorApproveRequest = async (req, res) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const { loginData, id } = req.body;
      const request = await db.DoctorAppointmentRequest.findOne({
        where: { id },
        transaction: t,
      });
      if(request.Status !== 0){
        throw new Error('Not Approvable');
      }

      request.Status = 1;
      const timesegment = await db.DoctorAvailableTimeSegment.findOne({
        where: { id: request.TimeSegment },
        transaction: t,
      });
      timesegment.Status = -1;
      await timesegment.save({transaction: t});
  
      const requests = await db.DoctorAppointmentRequest.update({ Status: -1 }, {
        where: {
          TimeSegment: { [Op.eq]: request.TimeSegment },
          id: { [Op.ne]: request.id },
        },
        transaction: t,
      });

      await request.save({transaction: t});
      res.json({ status: 'OK' });
    });
  } catch (error) {
    console.error("Error doctorApproveRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientSearchForTimeSegments = async (req, res) => {
  try {
    const { loginData, start, end } = req.body;
    const timesegments = await db.DoctorAvailableTimeSegment.findAll({
      where: {
        Status: { [Op.gte]: 0 },
        Start: { [Op.lte]: end },
        End: { [Op.gte]: start },
      },
    });

    //console.log(JSON.stringify(timesegments));
    res.json({ status: 'OK', result: await Promise.all(timesegments.map(async (record) => ({
      id: record.id,
      doctor: await getDoctor(record.Doctor),
      status: record.Status,
      start: record.Start,
      end: record.End,
      description: record.Description,
    })))});
  } catch (error) {
    console.error("Error patientSearchForTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.patientBookTime = async (req, res) => {
  try {
    return await db.sequelize.transaction(async (t) => {
      const { loginData, id, description } = req.body;
      const timesegment = await db.DoctorAvailableTimeSegment.findOne({
        where: { id: id },
        transaction : t,
      });
      if(timesegment.Status < 0){
        res.json({ status: 'AlreadyBooked'});
        throw new Error('AlreadyBooked');
      }
      timesegment.increment('Status', { by: 1, transaction: t});

      const request = db.DoctorAppointmentRequest.build({
        Patient: loginData.id,
        TimeSegment: timesegment.id,
        Status: 0,
        Description: description,
      });
      await request.save({transaction: t});

      res.json({ status: 'OK', result: request.id });
    });
  } catch (error) {
    console.error("Error patientBookTime:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

/*
exports.doctorDeleteAvailableTimeSegment = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: {
        id: req.body.id,
        Doctor: user.id,
      },
    });
    await timesegment.destroy();

    res.json({ status: 'OK' });
  } catch (error) {
    console.error("Error doctorGetAvailableTimeSegments:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};

exports.updateAppointmentRequest = async (req, res) => {
  try {
    const { user } = await parseUserToken(req.body.token);
    const request = await db.DoctorsAppointmentRequest.findOne({
      where: {
        id: req.body.id,
      },
    });
    request.Status = -1;
    const timesegment = await db.DoctorsAvailableTimeSegment.findOne({
      where: { id: request.TimeSegment },
    });
    timesegment.Status -= 1;
    await request.save();
    await timesegment.save();

    res.json({ status: 'OK' });
  } catch (error) {
    console.error("Error updateAppointmentRequest:", error);
    res.status(500).json({ status: 'InternalServerError' });
  }
};
*/
