import { ObjectId } from "mongodb";
import { db } from "../database.js";

/**
 * Creates a log entry model object.
 * 
 * @param {String} _id - MongoDB object ID for the log entry
 * @param {String} weatherDataId - ID of the deleted weather data
 * @param {String} deviceName - Name of the sensor
 * @param {Number} precipitation - Precipitation value
 * @param {Date} readingDateTime - Date and time of the reading
 * @param {Number} latitude - Latitude of the site 
 * @param {Number} longitude - Longitude of the site
 * @param {Number} temperature - Temperature value
 * @param {Number} atmosphericPressure - Atmospheric Pressure value
 * @param {Number} maxWindSpeed - Max Wind Speed value
 * @param {Number} solarRadiation - Solar Radiation value
 * @param {Number} vaporPressure - Vapor Pressure value
 * @param {Number} humidity - Humidity value
 * @param {Number} windDirection - Wind Direction value
 * @param {String} userId - ID of the user who deleted the data
 * @param {Date} deletedAt - Date and time when the data was deleted
 * @returns {Object} - The log entry model object
 */
export function DeletedData(
    _id, 
    weatherDataId, 
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
    windDirection,
    deletedBy,
    deletedAt
) {
    return {
        _id: _id ? new ObjectId(_id) : null,
        weatherDataId: new ObjectId(weatherDataId),
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
        deletedBy,
        deletedAt: new Date(deletedAt)
    };
}

export async function insertDeleted(deleteData) {
    return db.collection("deleted_data").insertOne(deleteData)
}