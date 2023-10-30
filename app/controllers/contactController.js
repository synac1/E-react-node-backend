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





