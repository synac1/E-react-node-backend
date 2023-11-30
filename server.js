const express = require("express");
const cors = require("cors");
const app = express();
const userRoutes = require("./app/routes/userRoutes");
const appointmentRoutes = require('./app/routes/appointmentRoutes');
const diagnostic = require('./app/controllers/diagnostic');
const chatRoutes = require("./app/routes/chatRouter");
const session = require('express-session');

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

app.use(session({
  secret: 'eHospital', 
  resave: false,
  saveUninitialized: true,
  cookie:{
    maxAge:1000*3600,
    secure:false
  }
}));

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

app.get("/skinDiseasesData/:id", async (req, res) =>
{
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("Skin_Diseases");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
})

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

app.post("/skinDiseasesData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("Skin_Diseases");
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

// Bone cancer code

app.get("/boneData/:id", async (req, res) => {
  const id = req.params.id;
  const db = client.db("htdata");
  const collection = db.collection("X-Ray_Feet");
  try {
    const result = await collection.findOne({ patient_id: parseInt(id) });
    res.send(result);
  } catch (err) {
    res.send("Error retrieving data by id");
  }
});

app.post("/boneData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { prediction } = req.body;
    const db = client.db("htdata");
    const collection = db.collection("X-Ray_Feet");
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
   sql = `SELECT P.id, 
                P.Fname AS PatientFName, 
                P.LName AS PatientLName, 
                DSRecent.service_date
                FROM patients_registration AS P
                JOIN (
                SELECT DS.patient_id, 
                      MAX(DS.service_date) AS service_date
                FROM doctor_servicehistory AS DS
                WHERE DS.doctor_id = "${doctorID}"
                GROUP BY DS.patient_id
                ORDER BY MAX(DS.service_date) DESC
                LIMIT 10
                ) AS DSRecent ON P.id = DSRecent.patient_id;
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
    /*
    //sending SMS message to remind using twilio.
    const accountSid = '';
    const authToken = '';
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: 'A new request is waiting for response, please check detail on the eHospital website.',
        from: '+',
        to: '+'
      })
      .then(message => console.log(message.sid))
      .done();
      */
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});

//------------contact us API end ---------------------



//-----------doctor help API start---------------------
app.post("/doctorhelp", async (req, res) => {
  const { formData } = req.body
  const help_name = formData.helpName.trim()
  const help_phone = formData.helpPhone.trim()
  const help_email = formData.helpEmail.trim()
  const help_message = formData.helpMessage.trim()
  const table_name = "doctors_help";

  // Execute query
  sql = `INSERT into ${table_name} (help_name, help_phone, help_email, help_message, help_reply)
  VALUES ("${help_name}", "${help_phone}", ${help_email ? '"' + help_email + '"' : "NULL"
    }, ${help_message ? '"' + help_message + '"' : "NULL"
    }, 0)
  ON DUPLICATE KEY 
  UPDATE help_name = "${help_name}", 
  help_phone = "${help_phone}",
  help_email = ${help_email ? '"' + help_email + '"' : "NULL"},
  help_message = ${help_message ? '"' + help_message + '"' : "NULL"},
  help_reply = 0;`;
  try {
    result = await mysql.query(sql);
  } catch (error) {
    console.log(error);
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.send({ success: "Form Submitted Successfully." });

});

//------------doctor help API end ---------------------


//patient Overview data
app.post("/patientOverview", async (req, res) => {
  const patientID = req.body.patientId;
  let patientData, patientTreatment, online_status;
  if (!patientID ) {
    res.send({ error: "Missing Patient ID." });
    console.log("Missing Patient ID.");
    return;
  }
    //queries
  const sql_patient_data= `select * from patients_registration where id="${patientID}"`;       
  const sql_patient_treatment =`select * 
                          from patients_treatment 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_online_status= `select session_status 
                      from online_patients 
                      where online_patient_id="${patientID}"`;
  //execute
  try {
    patientData = await mysql.query(sql_patient_data);
    patientTreatment = await mysql.query(sql_patient_treatment);
    online_status = await  mysql.query(sql_online_status);
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
    treatments: patientTreatment, 
    status: online_status.length > 0 ? online_status[0].session_status : "inactive"
  }
  //console.log(online_status[0].session_status, online_status)

  res.json(data);
})
//-----------------------
//Endpoint  to handle the save visit request
app.post('/saveVisit', (req, res) => {
  const visitDetails = req.body;
  console.log('Received visit details:', visitDetails);
  const sql_visit_data = `insert into doctor_patient_visits
  (doctor_id, patient_id, reason_for_visit, observations, date, start_time, end_time)
  values("${visitDetails.doctorId}", "${visitDetails.patientId}", 
  "${visitDetails.reasonForVisit}", "${visitDetails.notes}", "${visitDetails.visitDate}",
   "${visitDetails.startTime}", "${visitDetails.endTime}")`;

  const sql_registry= `insert into doctor_servicehistory(patient_id, doctor_id, service_date)
  values("${visitDetails.patientId}", "${visitDetails.doctorId}", "${visitDetails.visitDate}")`;

  //execute
  try {
    mysql.query(sql_visit_data);
    mysql.query(sql_registry);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  
  res.status(200).send({ message: 'Visit saved successfully' });
});
// Insert Treatment
app.post('/saveTreatment', (req, res) => {
  const treat = req.body;
  console.log(treat)
  const sql_treatment =`insert into patients_treatment(patient_id, doctor_id, treatment, RecordDate, disease_type , disease_id) 
  values 
  (   ${treat.patientId}, ${treat.doctorId},
     "${treat.treatment}","${treat.date}",
      ${treat.diseaseType ? "'"+ treat.diseaseType +"'": 'Null'},
      ${treat.diseaseId ? treat.diseaseId : 'Null'} )`;
     //execute
  try {
    mysql.query(sql_treatment);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
  res.status(200).send({ message: 'Treatment saved successfully' });
})
//Get Past Visits
app.post("/patientVisits", async (req, res) => {
  const doctorID= req.body.doctorId;
  const patientID = req.body.patientId;
  let patientVisits= [];
  //queries
  const sql_patient_visit= `select * from doctor_patient_visits 
                            where patient_id=${patientID} and doctor_id=${doctorID}`; 
  //execute
  try {
    patientVisits = await  mysql.query(sql_patient_visit);
    res.status(200).send(patientVisits);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
   
});
//Retrieve Doctor Reminder
app.post("/getDoctorReminders", async (req, res) => {
  const { doctorId } = req.body;
  // Select SQL query
  const sql_reminders = `select * from doctor_reminders where doctor_id=${doctorId}`;
  try {
      let data = await mysql.query(sql_reminders);
      res.status(200).send(data);
  } catch (error) {
      console.error("Error Retrieving reminder:", error);
      res.status(500).send({ error: "Error Retrieving reminding in MySQL." });
  }
});
// Save Doctor Reminder
app.post("/saveDoctorReminder", async (req, res) => {
  const { doctorId, reminderDescription } = req.body;
  // Insert SQL query
  const sql_insert_reminder = `insert into doctor_reminders(doctor_id, reminder_description) values (${doctorId}, '${reminderDescription}')`;
  try {
      await mysql.query(sql_insert_reminder);
      res.status(200).send({ message: "Reminder saved successfully" });
  } catch (error) {
      console.error("Error saving reminder:", error);
      res.status(500).send({ error: "Error saving reminder in MySQL." });
  }
});
//Retrieve Doctor To Patient Messages 
app.post("/getDoctorPatientMessages", async (req, res) => {
  const { doctorId, patientId } = req.body;
  // Select SQL query
  const sql_reminders = `select * from doctor_to_patient_message
                        where doctor_id=${doctorId} and patient_id=${patientId} 
                        order by time_stamp desc `;
  try {
      let data = await mysql.query(sql_reminders);
      res.status(200).send(data);
  } catch (error) {
      console.error("Error Retrieving messages:", error);
      res.status(500).send({ error: "Error Selecting reminder in MySQL." });
  }
});
//Send Doctor to Patient Message
app.post("/sendDoctorPatientMessage", async (req, res) => {
  const { doctorId, patientId, doctorFName, doctorLName,
     patientFName, patientLName, message, time} = req.body;
  // Select SQL query
  const sql_insert_message = `insert into doctor_to_patient_message
  (doctor_id, patient_id, doctor_FName, doctor_LName, patient_FName, 
    patient_LName, message, time_sent)
  values (${doctorId}, ${patientId}, '${doctorFName}', '${doctorLName}',
  '${patientFName}', '${patientLName}', '${message}', '${time}')`;
  try {
      await mysql.query(sql_insert_message);
      res.status(200).send({ message: "Message saved successfully" });
  } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).send({ error: "Error saveing reminder in MySQL." });
  }
});
//Surgery Planning
app.post("/saveSurgeryPlan", async (req, res) => {
  const { doctorId, patientId, surgeryType, surgeryDate, 
          preSurgeryConsultationDetails, riskAssessmentDetails, 
          postOperativeCarePlan } = req.body;

  // Insert SQL query
  const sql_insert_plan = `
    insert into surgery_planning (
      doctor_id, 
      patient_id, 
      surgery_type, 
      surgery_date, 
      pre_surgery_consultation_details, 
      risk_assessment_details, 
      post_operative_care_plan
    ) VALUES (
      ${doctorId}, 
      ${patientId}, 
      '${surgeryType}', 
      '${surgeryDate}', 
      '${preSurgeryConsultationDetails}', 
      '${riskAssessmentDetails}', 
      '${postOperativeCarePlan}'
    )`;

  try {
      await mysql.query(sql_insert_plan);
      res.status(200).send({ message: "Surgery plan saved successfully" });
  } catch (error) {
      console.error("Error saving surgery plan:", error);
      res.status(500).send({ error: "Error saving surgery plan in MySQL." });
  }
});
// Surgery Plan Retrieval
app.post("/getSurgeryPlan", async (req, res) => {
  const { doctorId } = req.body;
  console.log("Received doctorId:", doctorId);
  
  // SQL Query to retrieve the surgery plan
  const sql_retrieve_plan = `SELECT * FROM surgery_planning 
                             WHERE doctor_id = ${doctorId}`;

  try {
      const surgeryPlans = await mysql.query(sql_retrieve_plan);
      console.log("Query result:", surgeryPlans);
      res.status(200).send(surgeryPlans);
      
  } catch (error) {
      console.error("Error retrieving surgery plan:", error);
      res.status(500).send({ error: "Error retrieving surgery plan from MySQL." });
  }
});
//patientMedicalHistory
app.post("/patientMedicalHistory", async (req, res) => {
  const patientID = req.body.patientId;
  let physical_test_cad, physical_test_ckd, physical_test_hd, physical_test_ms, vaccines, bloodtests, ecg, eye_test, tumor;

  if (!patientID ) {
    res.send({ error: "Missing Patient ID." });
    console.log("Missing Patient ID.");
    return;
  }
    //queries
  const sql_physical_test_cad= `select * 
                         from physical_test_cad 
                         where patient_id=${patientID}
                         order by RecordDate desc
                         `;       
  const sql_physical_test_ckd =`select * 
                          from physical_test_ck 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_physical_test_hd = `select * 
                         from physical_test_hd 
                         where patient_id=${patientID}
                         order by RecordDate desc
                         `;       
  const sql_physical_test_ms =`select * 
                          from  physical_test_ms 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;

  const sql_vaccines =`select * 
                          from  vaccines 
                          where patient_id="${patientID}"
                          `;
  const sql_bloodtests=`select * 
                          from  bloodtests 
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_ecg=`select * 
                          from  ecg
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_eye_test=`select * 
                          from  eye_test
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  const sql_tumor=`select * 
                          from tumor
                          where patient_id="${patientID}"
                          order by RecordDate desc`;
  //execute
  try {
      // Execute all your queries
      physical_test_cad = await mysql.query(sql_physical_test_cad);
      physical_test_ckd = await mysql.query(sql_physical_test_ckd);
      physical_test_hd = await mysql.query(sql_physical_test_hd);
      physical_test_ms = await mysql.query(sql_physical_test_ms);
      vaccines = await mysql.query(sql_vaccines);
      bloodtests = await mysql.query(sql_bloodtests);
      ecg = await mysql.query(sql_ecg);
      eye_test = await mysql.query(sql_eye_test);
      tumor = await mysql.query(sql_tumor);
  
      // Calculate total records for each test
      const total_records = {
        physical_test_cad_total: physical_test_cad.length, 
        physical_test_ckd_total: physical_test_ckd.length, 
        physical_test_hd_total: physical_test_hd.length,
        physical_test_ms_total: physical_test_ms.length,
        vaccines_total: vaccines.length,
        bloodtests_total: bloodtests.length,
        ecg_total: ecg.length,
        eye_test_total: eye_test.length,
        tumor_total: tumor.length
      };
    // Combine all the data into one object
    const data = {
      total_records,
      physical_test_cad, 
      physical_test_ckd, 
      physical_test_hd,
      physical_test_ms,
      vaccines,
      bloodtests,
      ecg,
      eye_test,
      tumor
    };
    console.log(data);
    res.json(data);
  } catch (error) {
    console.log(error, "Something wrong in MySQL.");
    res.send({ error: "Something wrong in MySQL." });
    return;
  }
})

//-------------------------

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.

///voicerecognition code
const typeToCollectionMap = {
  bloodtest: 'Bloodtest_Report',
  mrispine: 'MRI_Spine',
  ctscanbrain: 'CTScan_Brain',
  ecgreport: 'ECG_Report',
  echocardiogram: 'Echocardiogram',
  ultrasoundabdomen: 'Ultrasound_Abdomen',
  medicalhistory: 'Medical_History',
};
 
app.get("/files/:fileType", async (req, res) => {
  const fileType = req.params.fileType;


  try {
    const db = client.db("htdata");
    const collectionName = typeToCollectionMap[fileType];

    if (!collectionName) {
      return res.status(400).send("Invalid file type");
    }

    const collection = db.collection(collectionName);
    const result = await collection.findOne({});

    if (!result) {
      return res.status(404).send("File not found");
    }

    console.log("Result:", result);

    if (!result.file) {
      console.error("Invalid file structure - 'file' field is missing:", result);
      return res.status(500).send("Invalid file structure - 'file' field is missing");
    }

    const { mimetype, buffer } = result.file;

    if (!buffer) {
      console.error("Invalid file structure - 'buffer' field is missing:", result);
      return res.status(500).send("Invalid file structure - 'buffer' field is missing");
    }

    res.setHeader('Content-Type', mimetype);
    res.send({ data: buffer.toString('base64'), mimetype });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection if needed
    // client.close();
  }
});

/**
 * Psychology Data Endpoint
 **/
app.get('/psychology/:patientId', async (req, res, nxt) => {
  const { patientId } = req.params;

  psychologysql = `SELECT * FROM psychology_information
          WHERE patient_id = "${patientId}" 
          limit 1`;

  patientsql = `SELECT case Gender
      when 'Male' then 1
      when 'Female' then 0
      else 2
      end as Gender,
      Age FROM patients_registration
        WHERE id = ${patientId}
        limit 1`;

  let psychologyData = null;
  let patientData = null;
  try {
      psychologyData = await mysql.query(psychologysql);
      patientData = await mysql.query(patientsql);
  } catch (error) {
      return res.status(500).send({ error: "Something wrong in MySQL" });
  }

  if (!psychologyData || !patientData) {
      return res.status(404).send({ error: "No patient matched in database." });
  }
  
  return res.json({...psychologyData[0], ...patientData[0]});
});

/**
 * Psychology Data Endpoint ends
 **/
