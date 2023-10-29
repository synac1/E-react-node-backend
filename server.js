const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoutes");
const app = express();
const multer = require("multer");
const corsOptions = {
  // origin: 'https://e-react-frontend-55dbf7a5897e.herokuapp.com',
  origin: "*", // Replace with your local React server's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};
var models = require('./app/models/commonMethod');
var mysql = require("./app/models/dbConnection");
const db = require("./db");
const mongodbConfig = require("./app/config/mongodb.config");
const uri = mongodbConfig.uri;
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);
app.use(cors(corsOptions));
// app.use(cors());
app.use("/api/users", userRoutes); // Mount user routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
    res.send({ error: "No patient matched in database." });
    console.log("No patient matched in database.");
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.
