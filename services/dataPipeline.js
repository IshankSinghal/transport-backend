const { MongoClient } = require("mongodb");
const fs = require("fs");
require("dotenv").config();
// Replace this with your MongoDB Atlas connection string
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

async function exportCollectionToCSV(dbName, collectionName) {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Fetch all documents in the collection
    const data = await collection.find({}).toArray();

    if (data.length === 0) {
      console.log(`No data found in collection: ${collectionName}`);
      return;
    }

    // Convert JSON to CSV
    const csv = data
      .map((item) => {
        return Object.values(item).join(",");
      })
      .join("\n");

    // Write the CSV to a file
    fs.writeFileSync(`${collectionName}.csv`, csv);
    console.log(`Exported ${collectionName} to ${collectionName}.csv`);
  } catch (err) {
    console.error(`Error exporting collection ${collectionName}:`, err);
  }
}

async function exportAllCollections() {
  try {
    await client.connect();

    const dbName = "test"; // Your database name
    const collections = [
      "clients",
      "shipments",
      "trucks",
      "users",
      "counters",
      "bills",
      "drivers",
    ];

    // Loop through each collection and export to CSV
    for (const collectionName of collections) {
      await exportCollectionToCSV(dbName, collectionName);
    }
  } finally {
    await client.close();
  }
}

// Start the export process
module.exports = { exportAllCollections };
