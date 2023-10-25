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
const { uri } = require("./app/models/mongodbConnection");

const { MongoClient } = require("mongodb");

const client = new MongoClient(uri);

app.use(cors(corsOptions));

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var mysql = require("./app/models/dbConnection");
const db = require("./db");
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

app.use("/api/users", userRoutes); // Mount user routes

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
  const phoneNumber = req.body.phoneNumber; // the patient phone number, e.g. "6131230000"
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.
