import * as WeatherData from "../models/weatherData.js";
import * as DeletedData from "../models/deletedData.js";
import * as Users from "../models/user.js";
import { ObjectId } from "mongodb";

/**
 * Controller for: GET /weather
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */
export async function getAllWeatherData(req, res) {
  try {
    console.log("Fetching weather data...");
    const weatherData = await WeatherData.getAll();
    console.log("Weather data fetched:", weatherData);

    res.status(200).json({
      status: 200,
      message: "All weather data retrieved successfully",
      data: weatherData,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve weather data",
      error: error.message,
    });
  }
}

// export async function getAllWeatherData(req, res) {
//     try {
//         console.log('Fetching weather data...');
//         const weatherData = await WeatherData.getAll();
//         console.log('Weather data fetched, the first piece is :', weatherData[0]);

//         if (!weatherData || weatherData.length === 0) {
//             return res.status(204).json({
//                 status: 204,
//                 message: "No weather data available"
//             });
//         }

//         res.status(200).json({
//             status: 200,
//             message: "All weather data retrieved successfully",
//             data: weatherData
//         });
//     } catch (error) {
//         console.error('Failed to retrieve weather data:', error);
//         res.status(500).json({
//             status: 500,
//             message: "Failed to retrieve weather data",
//             error: error.message
//         });
//     }
// }

// export async function getAllWeatherData(req, res) {
//     const weatherData = await WeatherData.getAll();
//     console.log('Inside getAllWeatherData');
//     console.log('all weatherData[0]:', weatherData[0])
//     res.status(200).json({
//         status: 200,
//         message: "Get all weather data",
//         weatherData: weatherData,
//     })
// }

// export async function getAllWeatherData(req, res) {
//     try {
//       const weatherData = await WeatherData.getAll();
//       console.log('Inside getAllWeatherData');
//       console.log('all weatherData[0]:', weatherData[0]);
//       res.status(200).json({
//         status: 200,
//         message: 'Get all weather data',
//         weatherData: weatherData,
//       });
//     } catch (error) {
//       res.status(500).json({
//         status: 500,
//         message: 'Error processing request',
//         error: error.message,
//       });
//     }
//   }

/**
 * Controller for: GET /weatherdata/:id
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */
export async function getWeatherDataById(req, res) {
  const { id } = req.params;
  try {
    const weatherData = await WeatherData.getWeatherById(id);
    if (weatherData) {
      res.status(200).json({
        status: 200,
        message: "Weather data retrieved successfully",
        data: weatherData,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve weather data",
      error: error.message,
    });
  }
}

/**
 * Controller for: GET /weatherdata/: page
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */

export async function getWeatherDataByPage(req, res) {
  const pageSize = 5;
  const page = parseInt(req.params.page);

  // Validate that the page is a number and is greater than or equal to 0
  if (isNaN(page) || page < 0) {
    return res.status(400).json({
      status: 400,
      message: "Invalid page number. Page must be a non-negative integer.",
    });
  }

  console.log("page is", page);

  try {
    const weatherData = await WeatherData.getByPage(page, pageSize);

    res.status(200).json({
      status: 200,
      message: "Get paginated weatherData on page " + page,
      weatherData: weatherData,
    });
  } catch (error) {
    // Handle potential errors from the WeatherData.getByPage function
    res.status(500).json({
      status: 500,
      message: "An error occurred while fetching weather data.",
      error: error.message,
    });
  }
}

/**
 * Controller for: POST /weatherdata
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */
export async function createWeatherData(req, res) {
  try {
    const {
      deviceName,
      precipitation,
      // readingDateTime,
      latitude,
      longitude,
      temperature,
      atmosphericPressure,
      maxWindSpeed,
      solarRadiation,
      vaporPressure,
      humidity,
      windDirection,
    } = req.body;

    if (humidity > 100) {
      return res.status(400).json({
        status: 400,
        message: "Validation failed: Humidity cannot exceed 100%",
      });
    }

    if (temperature > 60 || temperature < -50) {
      return res.status(400).json({
        status: 400,
        message:
          "Validation failed: Temperature cannot exceed 60°C or below -50°C.",
      });
    }
    const readingDateTime = new Date();
    const weatherData = WeatherData.WeatherData(
      null,
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
    );

    console.log("The weather data to be inserted is: ", weatherData);

    const result = await WeatherData.createWeather(weatherData);
    res.status(201).json({
      status: 201,
      message: "Weather data created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to create weather data",
      error: error.message,
    });
  }
}

/**
 * Controller for: DELETE /weatherdata/:id
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */

export async function deleteWeatherDataAndLogById(req, res) {
  const { id } = req.params;
  console.log("The id will be: ", id);
  const authenticationKey = req.get("X-AUTH-KEY");
  const currentUser = await Users.getByAuthenticationKey(authenticationKey);
  console.log("currentUser is: ", currentUser);

  if (currentUser.role !== "Teacher") {
    return res.status(403).json({
      status: 403,
      message: "You are not authorized to delete weather data.",
    });
  }

  try {
    const weatherData = await WeatherData.getWeatherById(id);

    if (!weatherData) {
      return res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }

    const deletedData = {
      ...weatherData,
      originalId: weatherData._id,
      deletedBy: currentUser.email,
      deletedAt: new Date(),
    };

    const result = await WeatherData.deleteById(id);

    if (result.deletedCount === 1) {
      // Create a deletion record

      console.log(
        "deletedData to be logged to deleted_data collection: ",
        deletedData
      );

      try {
        await DeletedData.insertDeleted(deletedData);
        return res.status(200).json({
          status: 200,
          message: "Weather data deleted successfully and logged.",
        });
      } catch (error) {
        console.error("Error inserting deleted data:", error);
        return res.status(500).json({
          status: 500,
          message: "Failed to log deleted data",
          error: error.message,
        });
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to delete weather data",
      error: error.message,
    });
  }
}

// export async function deleteWeatherDataById(req, res) {
//     const { id } = req.params
//     const objectId = new ObjectId(id)
//     console.log("The id will be: ", objectId);
//     const authenticationKey = req.get("X-AUTH-KEY");
//     const currentUser = await Users.getByAuthenticationKey(authenticationKey);
//     console.log("currentUser's role is: ", currentUser.role);

//     if (currentUser.role !== "Teacher") {
//         return res.status(403).json({
//             status: 403,
//             message: "You are not authorized to delete weather data."
//         });
//     }

//     try {
//         // Find the document to delete
//         const weatherData = await WeatherData.getWeatherById(id);

//         if (!weatherData) {
//             return res.status(404).json({
//                 status: 404,
//                 message: "Weather data not found"
//             });
//         }

//         // Prepare the deleted data record
//         const deletedData = {
//             ...weatherData,
//             originalId: weatherData._id,
//             deletedBy: currentUser.email,
//             deletedAt: new Date()
//         };

//         // Delete the document
//         const result = await WeatherData.deleteById(id);

//         if (result.deletedCount === 1) {
//             // Log the deleted data
//             await DeletedData.insertDeleted(deletedData);
//             return res.status(200).json({
//                 status: 200,
//                 message: "Weather data deleted successfully and logged."
//             });
//         } else {
//             return res.status(404).json({
//                 status: 404,
//                 message: "Weather data not found"
//             });
//         }
//     } catch (error) {
//         console.error('Error processing deletion:', error);
//         return res.status(500).json({
//             status: 500,
//             message: "Failed to delete weather data",
//             error: error.message
//         });
//     }
// }

//************************ The following is working only deleting, no adding to deleted_data collection******** */
export async function deleteWeatherDataById(req, res) {
  const { id } = req.params;
  const objectId = new ObjectId(id);
  console.log("The id will be: ", objectId);
  const authenticationKey = req.get("X-AUTH-KEY");
  const currentUser = await Users.getByAuthenticationKey(authenticationKey);
  console.log("currentUser's role is: ", currentUser.role);

  if (currentUser.role !== "Teacher") {
    return res.status(403).json({
      status: 403,
      message: "You are not authorized to delete weather data.",
    });
  }

  try {
    // Find the document to delete
    const weatherData = await WeatherData.getWeatherById(id);

    if (!weatherData) {
      return res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }

    // Delete the document
    const result = await WeatherData.deleteById(id);

    if (result.deletedCount === 1) {
      return res.status(200).json({
        status: 200,
        message: "Weather data deleted successfully.",
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }
  } catch (error) {
    console.error("Error processing deletion:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to delete weather data",
      error: error.message,
    });
  }
}

export async function deleteMultipleReadings(req, res) {
  const { ids } = req.body;

  try {
    const result = await WeatherData.deleteMultiple(ids);

    if (result.deletedCount > 0) {
      res.status(200).json({
        status: 200,
        message: `${result.deletedCount} weather data records deleted successfully.`,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No weather data records found to delete.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to delete weather data",
    });
  }
}

// export async function deleteDataById(req, res) {
//     const id = req.params.id;
//     const objectId = new ObjectId(id)

//     try {
//         // Fetch the existing user
//         const weatherData = await WeatherData.getById(objectId);
//         if (!weatherData) {
//             res.status(404).json({
//                 status: 404,
//                 message: "weather data not found",
//             });
//             return;
//         }

//         // Delete the user from the database
//         await WeatherData.deleteById(objectId);
//         res.status(200).json({
//             status: 200,
//             message: "User deleted successfully",
//         });
//     } catch (error) {
//         console.error("Error deleting user:", error);
//         res.status(500).json({
//             status: 500,
//             message: "Failed to delete weatherData",
//         });
//     }
// }

// /**
//  * Controller for: GET /weatherdata/sensor/:deviceName
//  * @param {Request} req The Request object
//  * @param {Response} res The Response object
//  */
// export async function getWeatherDataByDeviceAndDateRange(req, res) {
//     const { deviceName } = req.params;
//     const { start, end } = req.query;
//     try {
//         const weatherData = await WeatherData.getWeatherDataBySensorAndDateRange(deviceName, new Date(start), new Date(end));
//         res.status(200).json({
//             status: 200,
//             message: "Weather data retrieved successfully",
//             data: weatherData
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: "Failed to retrieve weather data",
//             error: error.message
//         });
//     }
// }

/**
 *
 * @param {request} req The request object
 * @param {response} res The response object
 */

export async function getMaxPrepDataByDeviceName(req, res) {
  const { deviceName, lastDay } = req.params;

  console.log("deviceName and lastDay", deviceName, lastDay);
  try {
    const maxPrecipitationData = await WeatherData.getMaxPrepByDeviceName(
      deviceName,
      lastDay
    );
    console.log("maxPrecipitationData :", maxPrecipitationData);
    if (maxPrecipitationData) {
      res.status(200).json({
        status: 200,
        message: "Max precipitation data retrieved successfully",
        data: {
          deviceName: maxPrecipitationData.deviceName,
          readingDateTime: maxPrecipitationData.readingDateTime,
          precipitation: maxPrecipitationData.precipitation,
        },
      });
    } else {
      // Handle case where no data is found
      res.status(404).json({
        status: 404,
        message:
          "No data found for the specified device name in the specified 5 months.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error retrieving max precipitation data",
      error: error.message,
    });
  }
}

/**
 * Controller for: PATCH /weatherdata/:id/precipitation
 * @param {Request} req The Request object
 * @param {Response} res The Response object
 */
export async function updatePrecipitationById(req, res) {
  const { id } = req.params;
  const { precipitation } = req.body;
  try {
    const result = await WeatherData.updatePrecipitationById(id, precipitation);
    if (result.modifiedCount === 1) {
      res.status(200).json({
        status: 200,
        message: "Precipitation updated successfully",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update precipitation",
      error: error.message,
    });
  }
}
export async function updateWeatherDataById(req, res) {
  const { id } = req.params;
  const updateData = req.body;

  console.log("the id of the data that needs to be updated is: ", id)
  console.log("the new data is: ", updateData)

  try {
    const original = await WeatherData.getWeatherById(id)
    console.log("data to be updated: ",original )

    const result = await WeatherData.updateWeatherDataById(id, updateData);
    if (result.modifiedCount === 1) {
      res.status(200).json({
        status: 200,
        message: "Weather data updated successfully",
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Weather data not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update weather data",
      error: error.message,
    });
  }
}

/**
 * Controller function to insert multiple sensor readings for a specific sensor
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export async function insertSensorReadings(req, res) {
  const { deviceName } = req.params; // Extract deviceName from URL parameters
  const readings = req.body; // Extract the array of sensor readings from the request body

  console.log("Device Name:", deviceName);
  console.log("Readings to be inserted:", readings);

  // Validate the input
  if (!deviceName) {
    return res.status(400).json({
      status: 400,
      message: "Request must include a valid deviceName in the URL parameters.",
    });
  }

  if (!Array.isArray(readings) || readings.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "Request body must be a non-empty array of sensor readings.",
    });
  }

  // Add deviceName to each reading
  const readingsWithDeviceName = readings.map((reading) => ({
    deviceName: deviceName, // Add deviceName first
    precipitation: reading.precipitation,
    readingDateTime: reading.readingDateTime,
    latitude: reading.latitude,
    longitude: reading.longitude,
    temperature: reading.temperature,
    atmosphericPressure: reading.atmosphericPressure,
    maxWindSpeed: reading.maxWindSpeed,
    solarRadiation: reading.solarRadiation,
    vaporPressure: reading.vaporPressure,
    humidity: reading.humidity,
    windDirection: reading.windDirection,
  }));

  console.log("Readings with deviceName:", readingsWithDeviceName);

  try {
    // Call the model function to insert the batch
    const result = await WeatherData.insertReadingsBatch(
      readingsWithDeviceName
    );
    res.status(201).json({
      status: 201,
      message: "Sensor readings inserted successfully",
      data: {
        insertedCount: result.insertedCount,
      },
    });
  } catch (error) {
    console.error("Error inserting sensor readings:", error);
    res.status(500).json({
      status: 500,
      message: "Failed to insert sensor readings",
      error: error.message,
    });
  }
}

export async function updateMultipleReadings(req, res) {
  const { ids, updateData } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input: IDs must be a non-empty array",
      });
    }

    if (typeof updateData !== "object" || updateData === null) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input: Update data must be a non-null object",
      });
    }

    const result = await WeatherData.updateMultipleReadings(ids, updateData);

    if (result.modifiedCount > 0) {
      res.status(200).json({
        status: 200,
        message: `${result.modifiedCount} weather data records updated successfully.`,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No weather data records found to update.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update weather data",
      error: error.message,
    });
  }
}

/**
 * Convert a date-time string to YYYYMMDDHHmmss format.
 * @param {string} dateTime - The date-time string in 'YYYY-MM-DD HH:mm:ss' format.
 * @returns {string} - The formatted date-time string in 'YYYYMMDDHHmmss' format.
 */
function convertToPathFormat(dateTime) {
  // Split the date-time string into date and time
  const [date, time] = dateTime.split(" ");

  // Remove dashes and colons from date and time
  const formattedDate = date.replace(/-/g, ""); // "20240825"
  const formattedTime = time.replace(/:/g, ""); // "123000"

  // Concatenate date and time in the desired format
  return formattedDate + formattedTime; // "20240825123000"
}

export async function getDataByDeviceAndDateTime(req, res) {
  const deviceName = req.params.deviceName;
  const dateTime = req.query.dateTime
  console.log("deviceName is: ", deviceName);
  console.log("dateTIme is: ", dateTime)
  const formattedDateTime = dateTime + '.000+00:00'
  console.log("formattedDateime: ", formattedDateTime)


  try {
  
    const result = await WeatherData.getByDeviceAndDateTime(
      deviceName,
      formattedDateTime
    );
    console.log("result is:", result);
    if (result) {
      res.status(200).json({
        status: 200,
        message: "Retrieve data by date and time on the device is successful.",
        data: result,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "No data found.",
      });
    }
  } catch (error) {
    console.error("Error retrieve the data of precipitation", error);
    res.status(500).json({
      status: 500,
      message: "Failed to retrieve data",
      error: error.message,
    });
  }
}

export async function getMaxTempDataByStartDateAndEndDate(req, res) {
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;
  console.log("startDate and endDate from params are: ", startDate, endDate);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required" });
  }
  // const isoStartDate = new Date(startDate)
  // const isoEndDate = new Date(endDate)

  // Convert YYYYMMDD to ISO Date format (YYYY-MM-DD)
  const isoStartDate = new Date(
    `${startDate.slice(0, 4)}-${startDate.slice(
      4,
      6
    )}-${startDate.slice(6, 8)}`
  );
  const isoEndDate = new Date(
    `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(
      6,
      8
    )}`
  );

  console.log("iso startDate and endDate are: ", isoStartDate, isoEndDate);

  if (isNaN(isoStartDate.getTime()) || isNaN(isoEndDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    const result = await WeatherData.getMaxTempByStartDateAndEndDate(
      isoStartDate,
      isoEndDate
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the specified date range" });
    } else {
      res.status(200).json({
        status: 200,
        message: "Data successfully retrieved",
        result: result,
      });
    }
  } catch (error) {
    console.error("Error retrieving data:", error.message);
    res.status(500).json({ error: "Database query failed" });
  }
}
