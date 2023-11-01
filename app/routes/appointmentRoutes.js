const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");

router.post("/doctorGetCalendar", appointmentController.doctorGetCalendar)
router.post("/patientGetCalendar", appointmentController.patientGetCalendar)
router.post("/getTimeSegmentDetail", appointmentController.getTimeSegmentDetail)
router.post("/doctorCreateAvailableTimeSegment", appointmentController.doctorCreateAvailableTimeSegment)
router.post("/doctorApproveRequest", appointmentController.doctorApproveRequest)
router.post("/patientSearchForTimeSegments", appointmentController.patientSearchForTimeSegments)
router.post("/patientBookTime", appointmentController.patientBookTime)

module.exports = router;
