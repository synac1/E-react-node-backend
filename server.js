const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./app/routes/userRoutes");
const appointmentRoutes = require('./app/routes/appointmentRoutes');
const diagnostic = require('./app/controllers/diagnostic');
const chatRoutes = require("./app/routes/chatRouter");

const expressWs = require('express-ws');
const multer = require('multer');
const corsOptions = {
  // origin: 'https://e-react-frontend-55dbf7a5897e.herokuapp.com',
  origin: "*", // Replace with your local React server's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
var mysql = require("./app/models/dbConnection");
const db = require("./db"); 

var models = require('./app/models/commonMethod');
const mongodbConfig = require("./app/config/mongodb.config");
const uri = mongodbConfig.uri;
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);
app.use(cors(corsOptions));
expressWs(app);

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/appointments", appointmentRoutes); // Mount user routes
app.use("/api/diagnostic", diagnostic);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Move the root route handler outside the database connection block
app.get("/", (req, res) => {
  res.send("Welcome to your server!");
});

app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/chat",chatRoutes);

//New Api's start from here


//shake waseef code 
app.get("/skinCancerData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("Skin_Images");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.post("/skinCancerData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("Skin_Images");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});


//Adeeb's code

app.get("/pneumoniaData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("X-Ray_Chest");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.post("/pneumoniaData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("X-Ray_Chest");
    const filter = {
      patient_id: parseInt(id),
    };

    const updateDoc = {
      $set: {
        prediction: prediction,
      },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 1) {
      res.send("Document updated successfully.");
    } else {
      res.send("Document not found or not updated.");
    }
  } catch (err) {
    res.send(err);
  }
});


app.post("/searchpatient", (req, res) => {
  const phoneNumber = req.body.phoneNumber; // patient phone number, e.g. "6131230000"
  //console.log("in node searchpatient post api you searched for ",phoneNumber);
  // Check patient identity
  if (!phoneNumber) {
    res.send({ error: "Missing patient phone number" });
    return;
  }
  var patient_id = 0;
  var check_list = [];
  let sqlDB = mysql.connect();
  sql = `
      SELECT *
      FROM patients_registration 
      WHERE MobileNumber = "${phoneNumber}"
  `;
  console.log(sql);
  sqlDB.query(sql, (error, result) => {
    if (error) {
      res.send({ error: "Something wrong in MySQL." });
      console.log("Something wrong in MySQL");
      return;
    }
    if (result.length != 1) {
      check_list[0] = 1;
      // res.render('pages/searchpatient', {check:check_list});
      res.send({ error: "No patient matched in database." });

      return;
    }
    patient_id = result[0].id;
    sql_search_query = `SELECT * FROM patients_registration WHERE id = "${patient_id}"`;
    let sqlDB = mysql.connect();
    sqlDB.query(sql_search_query, function (err, result) {
      if (err) throw err;

      ///res.render() function
      // res.send(result.id);
      res.json(result[0]);
      console.log(result[0]);
    });
    sqlDB.end();

    //console.log(sql_search_query);
  });
  sqlDB.end();
});

// This is the API for retrieving image from MongoDB by patient phone number
app.post("/imageRetrieveByPhoneNumber", async (req, res) => {
  const phoneNumber = req.body.phoneNumber; // patient phone number, e.g. "6131230000"
  const recordType = req.body.recordType; // the record type, e.g. "X-Ray", this represents the collection in the database (case sensitive)

  // Check parameters
  if (!phoneNumber) {
    res.send({ error: "Missing patient phone number." });
    console.log("Missing patient phone number.");
    return;
  }
  if (!recordType) {
    res.send({ error: "Missing record type." });
    console.log("Missing record type.");

    return;
  }

  // Execute query
  sql = `SELECT id FROM patients_registration WHERE MobileNumber = "${phoneNumber}"`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }

  // Check patient result
  if (result.length != 1) {
    res.send({ error: "No patient matched in database." });
    console.log("No patient matched in database.");
    return;
  }

  let patient_id = result[0].id;

  const MongoResult = await models.imageRetrieveByPatientId(
    patient_id,
    recordType
  );
  res.send(MongoResult);
});

// This is the API for retrieving image from MongoDB by record id
app.post("/imageRetrieveByRecordId", async (req, res) => {
  const _id = req.body._id; // record id, e.g. "640b68a96d5b6382c0a3df4c"
  const recordType = req.body.recordType; // the record type, e.g. "X-Ray", this represents the collection in the database (case sensitive)

  // Check parameters
  if (!_id) {
    res.send({ error: "Missing record id." });
    return;
  }
  if (!recordType) {
    res.send({ error: "Missing record type." });
    return;
  }

  const MongoResult = await models.imageRetrieveByRecordId(_id, recordType);
  res.send(MongoResult);
});

// This API is for updating the ML prediction result to the database.
app.post("/updateDisease", async (req, res) => {
  const phoneNumber = req.body.phoneNumber; // the patient phone number, e.g. "6131230000" also we can use 6131230016
  const disease = req.body.disease; // the name of the disease, e.g. "pneumonia"
  const date = req.body.date; // the prediction date, e.g. "2023-03-01 09:00:00"
  const prediction = req.body.prediction; // the prediction result, "1" if disease, "0" otherwise
  const description = req.body.description; // more description of this disease, like the subtype of this disease.
  const accuracy = req.body.accuracy; // prediction accuracy, e.g. "90%"
  const recordType = req.body.recordType; // the type of the health test, e.g. "X-Ray" or "ecg"
  const recordId = req.body.recordId; // the id of the health test, e.g. "12", "640b68a96d5b6382c0a3df4c"

  if (!phoneNumber || !disease || !date || !description) {
    res.send({
      error: "Missing patient phone number, disease, date, or prediction.",
    });
    return;
  }

  // Execute query
  sql = `SELECT id FROM patients_registration WHERE MobileNumber = "${phoneNumber}"`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }

  // Check patient result;
  if (result.length != 1) {
    res.send({ error: "No patient matched in database." });
    return;
  }

  let patient_id = result[0].id;

  // Execute query
  sql = `INSERT into ${disease} (patient_id, prediction_date, prediction, description, accuracy, record_type, record_id)
  VALUES (${patient_id}, "${date}", "${prediction}", ${
    description ? '"' + description + '"' : "NULL"
  }, ${accuracy ? '"' + accuracy + '"' : "NULL"}, ${
    recordType ? '"' + recordType + '"' : "NULL"
  }, ${recordId ? '"' + recordId + '"' : "NULL"})
  ON DUPLICATE KEY 
  UPDATE prediction_date = "${date}", 
  prediction = "${prediction}",
  description = ${description ? '"' + description + '"' : "NULL"},
  accuracy = ${accuracy ? '"' + accuracy + '"' : "NULL"},
  record_type = ${recordType ? '"' + recordType + '"' : "NULL"},
  record_id = ${recordId ? '"' + recordId + '"' : "NULL"};`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Submit success." });
});
//--
//API to get physicaltestckdata by patient_id
app.post("/getPhysicaltestCK", async (req, res) => {
  const patientID = req.body.patientId; //patient ID
  if (!patientID) {
    res.send({ error: "Missing patient ID." });
    console.log("Missing patient ID.");
    return;
  }
  // Execute query
  sql = `SELECT * FROM physical_test_ck
            WHERE patient_id = "${patientID}" 
            order by recordDate desc limit 1`;

  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  // Check patient result
  if (result.length <= 0) {
    console.log("No patient matched in database.");
    res.send({ error: "No patient matched in database." });
    return;
  }
  const response_for_request = {
    record_id: result[0].id,
    record_date: result[0].RecordDate,
    data: [
      result[0].age,
      result[0].blood_pressure,
      result[0].specific_gravity,
      result[0].albumin,
      result[0].sugar,
      result[0].red_blood_cells,
      result[0].pus_cell,
      result[0].pus_cell_clumps,
      result[0].bacteria,
      result[0].blood_glucose_random,
      result[0].blood_urea,
      result[0].serum_creatinine,
      result[0].sodium,
      result[0].potassium,
      result[0].haemoglobin,
      result[0].packed_cell_volume,
      result[0].white_blood_cell_count,
      result[0].red_blood_cell_count,
      result[0].hypertension,
      result[0].diabetes_mellitus,
      result[0].coronary_artery_disease,
      result[0].appetite,
      result[0].peda_edema,
      result[0].aanemia,
    ],
  };
  console.log(response_for_request);
  res.json(response_for_request);
});
//----
//top_five_recent_patients_per_doctor
app.post("/TopFiveRecentPatients", async (req, res) => {
 // console.log("got here here");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `select  DS.service_date, P.id, P.Fname as  PatientFName, P.LName as PatientLName
   from  patients_registration as P, doctor_servicehistory as DS
   where DS.doctor_id ="${doctorID}" and DS.patient_id = P.id
   order by service_date desc 
   limit 5;`;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result);
}
)
//----
//Patients_authorized_per_doctor
app.post("/DoctorPatientsAuthorized", async (req, res) => {
  //console.log("docrecordauthorized");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `
          select DA.patient_id as id, P.FName, P.LName, P.MobileNumber, substr(P.MName,1,1) as MI, 
          P.Age, P.Gender, P.weight
          from  doctor_recordauthorized  as DA,  patients_registration as P
          where DA.doctor_id = "${doctorID}" and DA.patient_id = P.id;`;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result);
}
)
//---------------------Thyroid Disease API ------------------------
app.post("/getThyroidDiseaseData", async (req, res) => {
  const patientID = req.body.patientId; //patient ID
  if (!patientID) {
    res.send({ error: "Missing patient ID." });
    console.log("Missing patient ID.");
    return;
  }
  
  // Execute query
  let sql = `SELECT * FROM nkw2tiuvgv6ufu1z.thyroid_disease 
            WHERE id = "${patientID}" 
            order by id desc limit 1`;  // Assuming you have a field to order by. Adjust if needed.

  let result;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  
  // Check patient result
  if (result.length <= 0) {
    res.send({ error: "No patient matched in database." });
    console.log("No patient matched in database.");
    return;
  }
  
  const response_for_request = {
    record_id: result[0].id,
    data: {
      age: result[0].age,
      sex: result[0].sex,
      TSH: result[0].TSH,
      T3: result[0].T3,
      T4U: result[0].T4U,
      FTI: result[0].FTI,
      onthyroxine: result[0].onthyroxine,
      queryonthyroxine: result[0].queryonthyroxine,
      onantithyroidmedication: result[0].onantithyroidmedication,
      sick: result[0].sick,
      pregnant: result[0].pregnant,
      thyroidsurgery: result[0].thyroidsurgery,
      I131treatment: result[0].I131treatment,
      queryhypothyroid: result[0].queryhypothyroid,
      queryhyperthyroid: result[0].queryhyperthyroid,
      lithium: result[0].lithium,
      goitre: result[0].goitre,
      tumor: result[0].tumor,
      hypopituitary: result[0].hypopituitary,
      psych: result[0].psych,
      //result: result[0].result
    }
  };

  console.log(response_for_request);
  res.json(response_for_request);
});

//--- Important Info for doctor profile
//Patients_authorized_per_doctor
app.post("/DoctorProfileInfo", async (req, res) => {
  //console.log("docrecordauthorized");
  const doctorID = req.body.doctorId;
  if (!doctorID ) {
    res.send({ error: "Missing Doctor ID." });
    console.log("Missing Doctor ID.");
    return;
  }
   //query
   sql = `
      select a.FName, a.LName,a.Age, a.MobileNumber, a.EmailId,
      a.Medical_LICENSE_Number,a.Specialization,a.City, 
      count(b.doctor_id ="${doctorID}") as active_patients
      from  doctors_registration as a, doctor_recordauthorized  as b
      where a.id="${doctorID}" and a.id=b.doctor_id;       
   `;
   //execute
   try {
    result = await mysql.query(sql);
    } catch (error) {
      console.log(error, "Something wrong in MySQL.");
      res.send({ error: "Something wrong in MySQL." });
      return;
  }
  if (result.length==0){
    res.send({ error: "No records found." });
    return;
  }
  res.json(result[0]);
}
)
//---Ending  DocProfile

//---------------------Breast cancer API start------------------------
app.post("/getBreastCancerData", (req, res) => {

  console.log(req)

  const patient_id = req.body.patient_id; // patient id, e.g. "133"

  // Check patient identity
  if (!patient_id) {
      res.send({ error: "Missing patient id" });
      return;
  }
  var check_list = [];
  let sqlDB = mysql.connect();
  sql = `
      SELECT *
      FROM breast_cancer_details 
      WHERE patient_id = "${patient_id}"
  `;
  console.log(sql);
  sqlDB.query(sql, (error, result) => {
      if (error) {
          res.send({ error: "Something wrong in MySQL." });
          console.log("Something wrong in MySQL");
          return;
      }
      if (result.length != 1) {
          check_list[0] = 1;
          res.send({ error: "No patient matched in database." });
          return;
      }

      res.json(result[0]);
      console.log(result[0]);
  });
  sqlDB.end();
});
//---------------------Breast cancer API end ------------------------
/**
 * Heart Stroke Data Endpoint
 **/
app.get('/heartstroke/:patientId', async (req, res, nxt) => {
  const { patientId } = req.params;

  strokesql = `SELECT * FROM heart_stroke
          WHERE patient_id = "${patientId}" 
          limit 1`;
      
  patientsql = `SELECT Gender as gender, Age as age FROM patients_registration
          WHERE id = "${patientId}" 
          limit 1`;

  let strokeData = null;
  let patientData = null;
  try {
      strokeData = await mysql.query(strokesql);
      patientData = await mysql.query(patientsql);
  } catch (error) {
      return res.status(500).send({ error: "Something wrong in MySQL" });
  }

  if (!strokeData || !patientData) {
      return res.status(404).send({ error: "No patient matched in database." });
  }
  
  return res.json({...strokeData[0], ...patientData[0]});
});

/**
 * Heart Stroke Data Endpoint ends
 **/
// -------------------Liver Preidiction API -------------------------//
app.post("/liver_disease", async (req, res) => {
    const patientID = req.body.patientId //patient ID
    if(!patientID) {
        res.send({ error: "Missing patient ID." });
        console.log("Missing patient ID.");
        return;
    }
     // Execute query
    sql = `SELECT * FROM liver_disease
            WHERE patients_id = "${patientID}" 
            order by recordtime desc limit 1`;

    try {
        result = await mysql.query(sql);
    } catch (error) {
      console.log(error,"Something wrong in MySQL---." );
      res.send({ error: "Something wrong in MySQL---." });
      return;
    }
      // Check patient result
    if (result.length <=0) {
        res.send({ error: "No patient matched in database." });
        console.log("No patient matched in database." );
        return;
    }
    const response_for_request =
    {   "record_id": result[0].patients_id,
        "record_date":result[0].recordtime,
        "data":
        [
            result[0].custom_age,
            result[0].Total_Bilirubin,
            result[0].Direct_Bilirubin,
            result[0].Alkaline_Phosphotase,
            result[0].Alamine_Aminotransferase,
            result[0].Aspartate_Aminotransferase,
            result[0].Total_Protiens,
            result[0].Albumin,
            result[0].Albumin_and_Globulin_Ratio,
            result[0].Gender_Female,
            result[0].Gender_Male,
        ]
    }
    console.log(response_for_request);
    res.json(response_for_request);
});


//-----------contact us API start---------------------
app.post("/contact", async (req, res) => {
  const { formData } = req.body
  const contact_name = formData.contactName.trim()
  const contact_phone = formData.contactPhone.trim()
  const contact_email = formData.contactEmail.trim()
  const contact_topic = formData.contactTopic.trim()
  const contact_message = formData.contactMessage.trim()
  const table_name = "contact_us";

  // Execute query
  sql = `INSERT into ${table_name} (contact_name, contact_phone, contact_email, contact_topic, contact_message, contact_reply)
  VALUES ("${contact_name}", "${contact_phone}", ${contact_email ? '"' + contact_email + '"' : "NULL"
    }, "${contact_topic}", ${contact_message ? '"' + contact_message + '"' : "NULL"
    }, 0)
  ON DUPLICATE KEY 
  UPDATE contact_name = "${contact_name}", 
  contact_phone = "${contact_phone}",
  contact_email = ${contact_email ? '"' + contact_email + '"' : "NULL"},
  contact_topic = ${contact_topic ? '"' + contact_topic + '"' : "NULL"},
  contact_message = ${contact_message ? '"' + contact_message + '"' : "NULL"},
  contact_reply = 0;`;
  try {
    result = await mysql.query(sql);
    //sending SMS message to remind using twilio.
    const accountSid = 'ACdad74b829d1979b25038c1261561dac7';
    const authToken = 'efb0415d6d1aba66b3db29dc453a0fc7';
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: 'A new request is waiting for response, please check detail on the eHospital website.',
        from: '+12255353632',
        to: '+13435585817'
      })
      .then(message => console.log(message.sid))
      .done();
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});

//------------contact us API end ---------------------





//patient Overview data
app.post("/patientOverview", async (req, res) => {
  const patientID = req.body.patientId;
  if (!patientID ) {
    res.send({ error: "Missing Patient ID." });
    console.log("Missing Patient ID.");
    return;
  }
    //queries
  sql_patient_data= `select * from patients_registration where id="${patientID}"`;       
  sql_patient_treatment =`select * 
                          from patients_treatment 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  //execute
  try {
    patientData = await mysql.query(sql_patient_data);
    patientTreatment = await mysql.query(sql_patient_treatment);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  if (patientData.length<=0){
    res.send({ error: "No records found." });
    return; 
  }
  const data={
    patient_data: patientData[0],
    treatments: patientTreatment
  }
  //console.log(patientData) 
  
  res.json(data);
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.
