const dbConfig = require("../../app/config/db.config");

const db = require("../../db");
const { QueryTypes } = require("sequelize");

exports.getContactUs = async (req, res) => {

  console.log("contact")

  try {
    const contact = await db.sequelize.query(
      "SELECT * FROM nkw2tiuvgv6ufu1z.contact_us",
      { type: QueryTypes.SELECT }
    );
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getReviews = async (req, res) => {

  console.log("reviews")

  try {
    const reviews = await db.sequelize.query(
      "SELECT * FROM nkw2tiuvgv6ufu1z.userreviews",
      { type: QueryTypes.SELECT }
    );
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getHelp = async (req, res) => {

  console.log("reviews")

  try {
    const reviews = await db.sequelize.query(
      "SELECT * FROM nkw2tiuvgv6ufu1z.doctors_help",
      { type: QueryTypes.SELECT }
    );
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


