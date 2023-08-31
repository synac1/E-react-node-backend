const express = require("express");
const cors = require("cors");
const userRoutes = require("./app/routes/userRoutes");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = require("./db"); 
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    app.get("/", (req, res) => {
      res.send("Welcome to your server!");
    });
  
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users",userRoutes); // Mount user routes

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

