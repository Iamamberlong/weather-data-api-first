import { ObjectId } from "mongodb";
import { db } from "../database.js";

/**
 *
 * @param {String} _id - MongoDB object ID for the weather data
 * @param {String} deviceName - Name of the sensor
 * @param {Number} precipitation - Precipitation value
 * @param {Date} readingDateTime - Date and time of the reading
 * @param {Number} latitude - the latitude of the site
 * @param {Number} longitude - the longitude of the site
 * @param {Number} temperature - Temperature value
 * @param {Number} atmosphericPressure - AtmosphericPressure Value
 * @param {Number} maxWindSpeed - Max Wind Speed value
 * @param {Number} solarRadiation - Solar Radiation value
 * @param {Number} vaporPressure - Vapor Pressure value
 * @param {Number} humidity - humidity value
 * @param {Number} windDirection - wind Direction value
 * @returns {Object} - The weatherData model object
 */
export function WeatherData(
  _id,
  deviceName,
  precipitation,
  readingDateTime,
  latitude,
  longitude,
  temperature,
  atmosphericPressure,
  maxWindSpeed,
  solarRadiation,
  vaporPressure,
  humidity,
  windDirection
) {
  if (humidity > 100 || temperature > 60 || temperature < -50) {
    throw new Error("Invalid weather readings");
  }
  return {
    _id: _id ? new ObjectId(_id) : null,
    deviceName,
    precipitation,
    readingDateTime: new Date(readingDateTime),
    latitude,
    longitude,
    temperature,
    atmosphericPressure,
    maxWindSpeed,
    solarRadiation,
    vaporPressure,
    humidity,
    windDirection,
  };
}

/**
 * Get all weather data
 *
 * @returns {Promise<Object[]>} - A promise for the array of all weather data
 */
// export async function getAll() {
//     return db.collection("weather_data").find().toArray()
// }

export async function getAll() {
  try {
    const allWeatherData = await db.collection("weather_data").find().toArray();
    console.log("Data retrieved from database:", allWeatherData);
    return allWeatherData;
  } catch (error) {
    console.error("Error retrieving data from database:", error);
    throw error; // Ensure errors are caught in the controller
  }
}

export async function getByPage(page, size) {
  // Calculate page offset
  const offset = page * size;

  return db
    .collection("weather_data")
    .find()
    .skip(offset)
    .limit(size)
    .toArray();
}

// •	Find the temperature, atmospheric pressure, radiation, and precipitation
// recorded by a specific station at a given date and time.

/**
 * Retrieves weather data for a specific device at a specific date and time.
 * @param {string} deviceName - The name of the device.
 * @param {Date} dateTime - The date and time of the reading.
 * @returns {Promise<Object[]>} - The weather data matching the query.
 */
// export async function getByDeviceAndDateTime(deviceName, dateTime) {
//   const query = {
//     deviceName,
//     readingDateTime: new Date(dateTime), // Ensure the date is in Date format
//   };

//   const projection = {
//     _id: 0, // Exclude the default _id field
//     temperature: 1,
//     atmosphericPressure: 1,
//     solarRadiation: 1,
//     precipitation: 1,
//   };

//   try {
//     const result = await db
//       .collection("weather_data")
//       .find(query)
//       .project(projection)
//       .toArray();
//     return result;
//   } catch (error) {
//     console.error("Error querying the database:", error.message);
//     throw new Error("Database query failed");
//   }
// }

export async function getByDeviceAndDateTime(deviceName, readingDateTime) {
  // Convert the input datetime to a Date object
  const inputDate = new Date(readingDateTime);

  // Calculate the start of the hour (e.g., 2024-08-05 12:00:00)
  const startOfHour = new Date(inputDate);
  startOfHour.setMinutes(0, 0, 0); // Set minutes, seconds, and milliseconds to 0

  // Calculate the end of the hour (e.g., 2024-08-05 13:00:00)
  const endOfHour = new Date(startOfHour);
  endOfHour.setHours(startOfHour.getHours() + 1); // Increment by 1 hour

  // Define the query with the hour range
  const query = {
      deviceName,
      readingDateTime: {
          $gte: startOfHour, // Greater than or equal to the start of the hour
          $lt: endOfHour     // Less than the end of the hour
      }
  };

  console.log("query looks like: ", query)
  // Define the projection to include only necessary fields
  const projection = {
      _id: 0, // Exclude the default _id field
      temperature: 1,
      atmosphericPressure: 1,
      solarRadiation: 1,
      precipitation: 1,
      readingDateTime: 1
  };

  try {
      const result = await db
          .collection("weather_data")
          .find(query)
          .project(projection)
          .toArray();
      return result;
  } catch (error) {
      console.error("Error querying the database:", error.message);
      throw new Error("Database query failed");
  }
}


/**
 *
 * @param {String} deviceName - name of the device to search over
 * @param {Date} start - start date (inclusive)
 * @param {Date} end -end data (inclusive)
 * @returns {Promise<Object[]>} - A promise for the array of matching sightings
 */
export async function getWeatherDataBetweenDatesOnDevice(
  deviceName,
  start,
  end
) {
  const query = {
    deviceName: deviceName,
    readingDateTime: {
      $gte: start,
      $lte: end,
    },
  };
  return db.collection("weather_data").find(query).toArray();
}

/**
 * Insert the provided weather data into the database
 *
 * @param {Object} weatherData - Weather data to insert
 * @returns {Promise<InsertOneResult>} - The result of the insert operation
 */
export async function createWeather(weatherData) {
  delete weatherData._id;
  return db.collection("weather_data").insertOne(weatherData);
}

/**
 * Get weather data by ObjectId
 *
 * @param {ObjectId} id - MongoDB ObjectId of the weather data to get
 * @returns {Promise<Object>} - A promise for the matching weather data
 */
export async function getWeatherById(id) {
  return db.collection("weather_data").findOne({ _id: new ObjectId(id) });
}

/**
 * Get weather data by sensor name and date range
 *
 * @param {String} deviceName - Name of the sensor
 * @param {Date} start - Start date (inclusive)
 * @param {Date} end - End date (inclusive)
 * @returns {Promise<Object[]>} - A promise for the array of matching weather data
 */
export async function getBySensorAndDateRange(deviceName, start, end) {
  const query = {
    deviceName,
    readingDateTime: {
      $gte: new Date(start),
      $lte: new Date(end),
    },
  };
  return db.collection("weather_data").find(query).toArray();
}

/**
 * Update the precipitation value for a specific weather data entry
 *
 * @param {ObjectId} id - MongoDB ObjectId of the weather data to update
 * @param {Number} precipitation - New precipitation value
 * @returns {Promise<UpdateResult>} - The result of the update operation
 */
export async function updatePrecipitationById(id, precipitation) {
  return db
    .collection("weather_data")
    .updateOne({ _id: new ObjectId(id) }, { $set: { precipitation } });
}

/**
 * Delete weather data by id
 *
 * @param {ObjectId} id - MongoDB ObjectId of the weather data to delete
 * @returns {Promise<DeleteResult>} - The result of the delete operation
 */
export async function deleteById(id) {
  return db.collection("weather_data").deleteOne({ _id: new ObjectId(id) });
}

export async function deleteMultiple(ids) {
    try {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error("Invalid input: IDs must be a non-empty array.")
        }

        for (const id of ids) {
            if (!ObjectId.isValid(id)) {
                throw new Error(`Invalid ID format: ${id}`)
            }
        }

        const collection = db.collection('weather_data')
        const result = await collection.deleteMany({
            _id: {$in: ids.map(id => new ObjectId(id))}
        })
        return result

    } catch (error) {
        console.error("Error deleting weather data: ", error)
    }
}


/**
 *
 * @param {*} deviceName
 * @param {*} lastDay
 * @returns The Max precipitation for a specific device in 5 months ending with the lastDay.
 */

export async function getMaxPrepByDeviceName(deviceName, lastDay) {
  try {
    const collection = db.collection("weather_data");
    const endDate = new Date(lastDay);
    const startDate = new Date(endDate);

    // Subtract 5 months from the start date
    startDate.setMonth(startDate.getMonth() - 5);

    const result = await collection
      .aggregate([
        {
          $match: {
            deviceName: deviceName,
            readingDateTime: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $sort: { precipitation: -1 }, // Sort by precipitation in descending order
        },
        {
          $limit: 1, // Limit to the top record
        },
      ])
      .toArray();

    return result.length > 0 ? result[0] : null; // Return the maximum precipitation data
  } catch (error) {
    console.error("Error fetching max precipitation:", error);
    throw error;
  }
}

/**
 * Insert a batch of sensor readings into the database
 *
 * @param {Array<Object>} readings - An array of sensor reading objects
 * @returns {Promise<Object>} - A promise that resolves to the result of the insertion
 */
// src/models/weatherdata.js
export async function insertReadingsBatch(readings) {
  try {
    const collection = db.collection("weather_data"); // Adjust collection name as needed

    // Insert multiple documents at once
    const result = await collection.insertMany(readings);

    return {
      insertedCount: result.insertedCount,
    };
  } catch (error) {
    console.error("Error inserting sensor readings:", error);
    throw error;
  }
}

/**
 * Updates a weather data document by its ID with the provided update data.
 *
 * @param {string} id - The ID of the weather data document to update.
 * @param {object} updateData - The fields to update in the weather data document.
 * @returns {Promise<object>} The result of the update operation.
 */
export async function updateWeatherDataById(id, updateData) {
  try {
    // Ensure the ID is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    // Get the collection
    const collection = db.collection("weather_data"); // Adjust the collection name as needed

    // Update the document with the provided ID
    const result = await collection.updateOne(
      { _id: new ObjectId(id) }, // Query to find the document
      { $set: updateData } // Update operation
    );
    console.log("result is: ", result)

    return result;
  } catch (error) {
    console.error("Error updating weather data:", error);
    throw error;
  }
}

export async function updateMultipleReadings(ids, updateData) {
  try {
    // Validate that ids is an array and updateData is an object
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid input: IDs mut be a non-empty array");
    }
    if (typeof updateData !== "object" || updateData === null) {
      throw new Error("Invalid input: Update data must be a non-null object");
    }

    // Ensure all IDs are valid MongoDB ObjectIds
    for (const id of ids) {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ID format: ${id}`);
      }
    }

    const collection = db.collection("weather_data");

    const result = await collection.updateMany(
      { _id: { $in: ids.map((id) => new ObjectId(id)) } },
      { $set: updateData }
    );
  } catch (error) {
    console.error("Error updating weather data: ", error);
  }
}

/**
 * Retrieves the maximum temperature recorded for each device within a given date/time range.
 * @param {Date} startDate - The start date/time of the range.
 * @param {Date} endDate - The end date/time of the range.
 * @returns {Promise<Object[]>} - The device name, reading date/time, and maximum temperature value for each device.
 */
export async function getMaxTempByStartDateAndEndDate(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        readingDateTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $sort: {
        deviceName: 1,
        temperature: -1,
      },
    },
    {
      $group: {
        _id: "$deviceName",
        readingDateTime: { $first: "$readingDateTime" },
        temperature: { $first: "$temperature" },
      },
    },
    {
      $project: {
        _id: 0,
        deviceName: "$_id",
        readingDateTime: 1,
        temperature: 1,
      },
    },
  ];

  try {
    const result = await db
      .collection("weather_data")
      .aggregate(pipeline)
      .toArray();
    return result;
  } catch (error) {
    console.error("Error querying the database:", error.message);
    throw new Error("Database query failed");
  }
}
