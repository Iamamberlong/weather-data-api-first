# weather-data-api-first
# weather-data-api-first
🧩 Features

RESTful API Architecture

CRUD operations for Weather Data and Users.

Supports both single and batch sensor data insertion.

User Authentication & Authorization

Role-based access control for Teacher, User, and Sensor accounts.

Data Integrity & Validation

Rejects invalid readings (e.g., humidity > 100%, temperature < -50°C or > 60°C).

Database Triggers

Logs deleted weather data into a separate collection.

Updates user last login timestamp automatically.

Data Security

Encrypted data transmission and at-rest encryption.

Restricted MongoDB roles for database access.

Performance Optimization

Indexed queries for efficient analysis (temperature, humidity, rainfall trends).

TTL index to automatically remove inactive student users after 30 days.

Scalable MongoDB Setup

Sharding/replication for distributed deployment across multiple low-power servers (e.g., Raspberry Pi).

🗂️ Database Schema
Collections

1. weatherData
{
  "_id": "ObjectId",
  "stationId": "SC001",
  "stationName": "Sunshine Coast North",
  "datetime": "2022-11-10T08:00:00Z",
  "temperature": 24.6,
  "humidity": 78.3,
  "rainfall": 5.2,
  "pressure": 1012,
  "radiation": 110.4
}
2. users
{
  "_id": "ObjectId",
  "username": "teacher1",
  "password": "hashed_password",
  "role": "teacher", // teacher | user | sensor
  "createdAt": "2024-03-10T12:00:00Z",
  "lastLogin": "2024-04-12T15:00:00Z"
}
3. logs
{
  "timestamp": "2024-05-01T09:20:00Z",
  "action": "delete",
  "deletedData": { ... }
}
🔐 User Roles & Permissions
Role	Description	Permissions
Teacher	Administrator	Create/Read/Update/Delete Users & Weather Data
User	Student	Read-only access to weather data
Sensor	IoT Device	Add new weather readings only

Weather API Endpoints examples:

POST /weather
GET /weather/:id
GET /weather
GET /weather/page/:page
POST /weather/readings/:deviceName
GET /weather/max-prep/:deviceName/:lastDay
GET /weather/:deviceName/:dateTime
GET /weather/max-temp/:startDate/:endDate
PUT /weather/:id
DELETE /weather/:id

🧰 Tech Stack
Category	Technology
Backend Framework	Node.js (Express)
Database	MongoDB (NoSQL)
Authentication	JWT (JSON Web Token)
Encryption	HTTPS / TLS, MongoDB Encryption at Rest
Documentation	Swagger UI
Deployment	Docker + MongoDB Replica Set (Raspberry Pi compatible)

To run the project, please run the following commands:
git clone https://github.com/Iamamberlong/weather-data-api-first.git
cd weather-data-api-first

npm install
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/climateDB
JWT_SECRET=your_secret_key

npm start
