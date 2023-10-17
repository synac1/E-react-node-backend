const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoutes");
const app = express();
const corsOptions = {
 // origin: 'https://e-react-frontend-55dbf7a5897e.herokuapp.com', 
  origin: '*', // Replace with your local React server's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(cors(corsOptions));

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var mysql = require("./dbConnection");
const db = require("./db"); 
db.sequelize.authenticate()
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

app.post("/searchpatient", (req, res) => {
  
  const phoneNumber = req.body.phoneNumber; // patient phone number, e.g. "6131230000"
  console.log(phoneNumber);
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
      console.log("Pid:",patient_id);
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


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
//please do comments before and after your code part for better readibility.
