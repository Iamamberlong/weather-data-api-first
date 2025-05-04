
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.MONGO_URI;
const client = new MongoClient(connectionString);

let db;

async function connectToDatabase() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    // Initialize the database object
    db = client.db('weather_data_api');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Rethrow the error to be caught later if needed
  }
}

async function testDatabaseConnection() {
  try {
    const collection = db.collection('users'); // Replace with your collection name
    const result = await collection.findOne(); // Perform a test query
    console.log('Test query result:', result);
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
}

// Connect to the database and then test it
connectToDatabase()
  .then(() => {
    testDatabaseConnection();
  })
  .catch(err => {
    console.error('Failed to connect or test the database:', err);
  });

// Export the db object if needed in other parts of the application
export { db };

async function createPartialTTLIndex() {
  try {
    const collection = db.collection('users');

    // Create partial TTL index on the 'lastLogin' field for 'User' role only
    await collection.createIndex(
      { lastLogin: 1 }, // Index on lastLogin field
      {
        expireAfterSeconds: 2592000, // TTL of 30 days
        partialFilterExpression: { role: "User" } // Only apply to documents with role "User"
      }
    );
    console.log('Partial TTL index created on lastLogin field for User role in users collection.');
  } catch (err) {
    console.error('Error creating partial TTL index:', err);
  }
}



// import { MongoClient } from "mongodb";


// import * as dotenv from "dotenv"
// dotenv.config()

// const connectionString = process.env.MDBURI
// const client = new MongoClient(connectionString)
// export const db = client.db("weather_data_api")