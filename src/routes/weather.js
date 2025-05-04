import { Router } from "express";
import {
  createWeatherData,
  deleteWeatherDataById,
  getWeatherDataById,
  updateWeatherDataById,
  getAllWeatherData,
  getWeatherDataByPage,
  getMaxPrepDataByDeviceName,
  insertSensorReadings,
  deleteWeatherDataAndLogById,
  getDataByDeviceAndDateTime,
  getMaxTempDataByStartDateAndEndDate,
} from "../controllers/weather.js";
import auth from "../middleware/auth.js";

const weatherRouter = Router();

/**
 * @openapi
 * /weather:
 *  post:
 *      summary: Create Weather Data
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      requestBody:
 *          $ref: "#/components/requestBodies/NewWeatherData"
 *      responses:
 *          201:
 *              $ref: "#/components/responses/201_WeatherDataCreated"
 *          400:
 *              description: Bad Request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 400
 *                              message:
 *                                type: string
 *                                example: "Invalid weather data provided."
 *          403:
 *            $ref: "#/components/responses/403_Forbidden" 
 *          500:
 *            $ref: "#/components/responses/500_DatabaseError"
 */
weatherRouter.post("/", auth(["Teacher", "Sensor"]), createWeatherData);

/**
 * @openapi
 * /weather/{id}:
 *  get:
 *      summary: Get Weather Data by ID
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Weather Data ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_WeatherDataObject"
 *          400:
 *              description: Bad Request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 400
 *                              message:
 *                                type: string
 *                                example: "Invalid weather data ID provided."
 *          404:
 *              description: Weather Data not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 404
 *                              message:
 *                                  type: string
 *                                  example: "Weather Data not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
weatherRouter.get("/:id", auth(["Teacher", "User", "Sensor"]), getWeatherDataById);

/**
 * @openapi
 * /weather:
 *  get:
 *      summary: Get All Weather Data
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      responses:
 *        200:
 *          description: Response object with weather data array
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 200
 *                  message:
 *                    type: string
 *                    example: Get all weather data
 *                  weatherData:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/WeatherData"
 *        204:
 *          description: No Content
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 204
 *                  message:
 *                    type: string
 *                    example: No Content
 *        400:
 *          description: Invalid Request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 400
 *                  message:
 *                    type: string
 *                    example: Invalid Request
 *        403:
 *          $ref: "#/components/responses/403_Forbidden" 
 *        404:
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 404
 *                  message:
 *                    type: string
 *                    example: Not Found
 *        500:
 *          description: Database Error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 500
 *                  message:
 *                    type: string
 *                    example: Error processing request
 */
weatherRouter.get("/", auth(["Teacher"]), getAllWeatherData);

/**
 * @openapi
 * /weather/max-prep/{deviceName}/{lastDay}:
 *   get:
 *     summary: Get Maximum Precipitation in the last 5 Months for a Specific Sensor
 *     tags: [Weather]
 *     parameters:
 *       - name: deviceName
 *         in: path
 *         description: The name of the sensor to retrieve the maximum precipitation data for.
 *         required: true
 *         schema:
 *           type: string
 *           example: Noosa_Sensor
 *       - name: lastDay
 *         in: path
 *         description: The last day of the 5 months period you want to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2021-06-01
 *     responses:
 *       200:
 *         description: Successfully retrieved the maximum precipitation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Maximum precipitation data retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deviceName:
 *                       type: string
 *                       example: "sensor123"
 *                     readingDateTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-06T00:00:00Z"
 *                     precipitation:
 *                       type: number
 *                       format: float
 *                       example: 12.34
 *       404:
 *         description: No data found for the specified sensor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No precipitation data found for the specified sensor in the last 5 months
 *       500:
 *         description: Failed to retrieve data due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve maximum precipitation data
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */
weatherRouter.get("/max-prep/:deviceName/:lastDay", auth(["Teacher", "User", "Sensor"]), getMaxPrepDataByDeviceName);


/**
 * @openapi
 * /weather/{id}:
 *  put:
 *      summary: Update Weather Data
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Weather Data ID
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *          description: Updated weather data object
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          temperature:
 *                              type: number
 *                              example: 25.4
 *                          humidity:
 *                              type: number
 *                              example: 78
 *                          windSpeed:
 *                              type: number
 *                              example: 10.5
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_WeatherDataObject"
 *          204:
 *              $ref: "#/components/responses/204_NoContent"
 *          400:
 *              description: Bad Request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 400
 *                              message:
 *                                type: string
 *                                example: "Invalid weather data provided."
 *          403:
 *            $ref: "#/components/responses/403_Forbidden" 
 *          404:
 *              description: Weather Data not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 404
 *                              message:
 *                                  type: string
 *                                  example: "Weather Data not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
weatherRouter.put("/:id", auth(["Teacher"]), updateWeatherDataById);



/**
 * @openapi
 * /weather/{id}:
 *  put:
 *      summary: Update Weather Data
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Weather Data ID
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *          description: Updated weather data object
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                              description: The unique identifier of the weather data
 *                              example: "670137f1a5e1d7dda01a4a26"
 *                          deviceName:
 *                              type: string
 *                              example: "Test_Sensor"
 *                          humidity:
 *                              type: number
 *                              example: 100
 *                          latitude:
 *                              type: number
 *                              example: 152.77891
 *                          longitude:
 *                              type: number
 *                              example: -26.95064
 *                          maxWindSpeed:
 *                              type: number
 *                              example: 4.94
 *                          precipitation:
 *                              type: number
 *                              example: 100
 *                          readingDateTime:
 *                              type: string
 *                              format: date-time
 *                              example: "2021-05-07T03:44:04.000Z"
 *                          solarRadiation:
 *                              type: number
 *                              example: 113.21
 *                          temperature:
 *                              type: number
 *                              example: 22.74
 *                          vaporPressure:
 *                              type: number
 *                              example: 1.73
 *                          windDirection:
 *                              type: number
 *                              example: 100
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_WeatherDataObject"
 *          204:
 *              $ref: "#/components/responses/204_NoContent"
 *          400:
 *              description: Bad Request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 400
 *                              message:
 *                                type: string
 *                                example: "Invalid weather data provided."
 *          403:
 *            $ref: "#/components/responses/403_Forbidden" 
 *          404:
 *              description: Weather Data not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 404
 *                              message:
 *                                  type: string
 *                                  example: "Weather Data not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */

// weatherRouter.put('/weather/:id', auth["Teacher"], updateWeatherDataById);

/**
 * @openapi
 * /weather/{id}:
 *  delete:
 *      summary: Delete Weather Data
 *      tags: [Weather]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *          - name: id
 *            in: path
 *            description: Weather Data ID
 *            required: true
 *            schema:
 *               type: string
 *      responses:
 *          200:
 *              description: Weather Data successfully deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 200
 *                              message:
 *                                  type: string
 *                                  example: "Weather Data successfully deleted"
 *          400:
 *              description: Bad Request
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 400
 *                              message:
 *                                type: string
 *                                example: "Invalid weather data ID provided."
 *          403:
 *              description: Forbidden
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 403
 *                              message:
 *                                type: string
 *                                example: "You are not authorized to perform this action."
 *
 *          404:
 *              description: Weather Data not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 404
 *                              message:
 *                                  type: string
 *                                  example: "Weather Data not found"
 *          405:
 *              description: Method Not Allowed
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: integer
 *                                  example: 405
 *                              message:
 *                                  type: string
 *                                  example: "Method Not Allowed"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
weatherRouter.delete("/:id", auth(["Teacher"]), deleteWeatherDataAndLogById);

/**
 * @openapi
 * /weather/page/{page}:
 *    get:
 *      summary: Get Weather Data by Page
 *      tags: [Weather]
 *      parameters:
 *        - name: page
 *          in: path
 *          description: Page number
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Response object with sightings array
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 200
 *                  message:
 *                    type: string
 *                    example: Get weather data by page
 *                  weatherData:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/WeatherData"
 *        400:
 *          description: Invalid page number
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 400
 *                  message:
 *                    type: string
 *                    example: "Page number must not be negative integer number."
 *        500:
 *          description: 'Database error'
 *          content:
 *            application/json:
 *              schema:
 *                type: 'object'
 *                properties:
 *                  status:
 *                    type: 'number'
 *                  message:
 *                    type: 'string'
 *                example:
 *                  status: 500
 *                  message: "Error processing request"
 */
weatherRouter.get("/page/:page", auth(["Teacher", "User", "Sensor"]), getWeatherDataByPage);

/**
 * @openapi
 * /weather/readings/{deviceName}:
 *   post:
 *     summary: Insert Multiple Sensor Readings for a Specific Sensor
 *     tags: [Weather]
 *     parameters:
 *       - name: deviceName
 *         in: path
 *         description: The name of the sensor for which readings are being inserted.
 *         required: true
 *         schema:
 *           type: string
 *           example: "Test_Sensor"
 *     requestBody:
 *       description: An array of sensor readings to be inserted for the specified sensor.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 precipitation:
 *                   type: number
 *                   format: float
 *                   description: The amount of precipitation recorded.
 *                   example: 0.01
 *                 readingDateTime:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time when the reading was taken.
 *                   example: "2024-08-05T12:30:00Z"
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   description: The latitude of the sensor's location.
 *                   example: 36.16994
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   description: The longitude of the sensor's location.
 *                   example: -115.13983
 *                 temperature:
 *                   type: number
 *                   format: float
 *                   description: The temperature reading in degrees Celsius.
 *                   example: 33.2
 *                 atmosphericPressure:
 *                   type: number
 *                   format: float
 *                   description: The atmospheric pressure in hPa.
 *                   example: 1012.8
 *                 maxWindSpeed:
 *                   type: number
 *                   format: float
 *                   description: The maximum wind speed recorded in m/s.
 *                   example: 8.5
 *                 solarRadiation:
 *                   type: number
 *                   format: float
 *                   description: The solar radiation in W/m².
 *                   example: 180.34
 *                 vaporPressure:
 *                   type: number
 *                   format: float
 *                   description: The vapor pressure in kPa.
 *                   example: 0.8
 *                 humidity:
 *                   type: number
 *                   format: float
 *                   description: The humidity percentage.
 *                   example: 15.0
 *                 windDirection:
 *                   type: number
 *                   format: float
 *                   description: The wind direction in degrees.
 *                   example: 270.0
 *             description: A list of sensor readings to be inserted.
 *             example: [
 *               {
 *                 "precipitation": 0.01,
 *                 "readingDateTime": "2024-08-05T12:30:00Z",
 *                 "latitude": 36.16994,
 *                 "longitude": -115.13983,
 *                 "temperature": 33.2,
 *                 "atmosphericPressure": 1012.8,
 *                 "maxWindSpeed": 8.5,
 *                 "solarRadiation": 180.34,
 *                 "vaporPressure": 0.8,
 *                 "humidity": 15.0,
 *                 "windDirection": 270.0
 *               },
 *               {
 *                 "precipitation": 0.03,
 *                 "readingDateTime": "2024-08-05T13:30:00Z",
 *                 "latitude": 36.16994,
 *                 "longitude": -115.13983,
 *                 "temperature": 32.5,
 *                 "atmosphericPressure": 1013.1,
 *                 "maxWindSpeed": 7.2,
 *                 "solarRadiation": 175.20,
 *                 "vaporPressure": 1.0,
 *                 "humidity": 18.0,
 *                 "windDirection": 250.0
 *               },
 *               {
 *                 "precipitation": 0.02,
 *                 "readingDateTime": "2024-08-05T14:30:00Z",
 *                 "latitude": 36.16994,
 *                 "longitude": -115.13983,
 *                 "temperature": 34.0,
 *                 "atmosphericPressure": 1011.5,
 *                 "maxWindSpeed": 6.8,
 *                 "solarRadiation": 190.10,
 *                 "vaporPressure": 0.9,
 *                 "humidity": 12.0,
 *                 "windDirection": 260.0
 *               }
 *             ]
 *     responses:
 *       201:
 *         description: Successfully inserted sensor readings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Sensor readings inserted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     insertedCount:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad Request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Request body must include valid sensor readings."
 *       403:
 *         $ref: "#/components/responses/403_Forbidden" 
 *       500:
 *         description: Server Error - Failed to insert sensor readings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to insert sensor readings"
 *                 error:
 *                   type: string
 *                   example: "Error message here"
 */

weatherRouter.post("/readings/:deviceName", auth(["Teacher", "Sensor"]), insertSensorReadings);

/**
 * @openapi
 * /weather/{deviceName}/{dateTime}:
 *   get:
 *     summary: Retrieve sensor data by date and time for a specific device
 *     tags: [Weather]
 *     description: Fetches temperature, atmospheric pressure, solar radiation, and precipitation recorded by a specific sensor device at a given date and time.
 *     parameters:
 *       - name: deviceName
 *         in: path
 *         required: true
 *         description: The name of the sensor device.
 *         schema:
 *           type: string
 *           example: Test_Sensor
 *       - name: dateTime
 *         in: query
 *         required: true
 *         description: The date and time when the readings were taken.
 *         schema:
 *           type: string
 *           example: "2024-08-05 12:30:00"
 *     responses:
 *       200:
 *         description: Successfully retrieved sensor data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Retrieve data by date and time on the device is successful."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       temperature:
 *                         type: number
 *                         format: float
 *                         description: The temperature reading in degrees Celsius.
 *                         example: 33.2
 *                       atmosphericPressure:
 *                         type: number
 *                         format: float
 *                         description: The atmospheric pressure in hPa.
 *                         example: 1012.8
 *                       solarRadiation:
 *                         type: number
 *                         format: float
 *                         description: The solar radiation in W/m².
 *                         example: 180.34
 *                       precipitation:
 *                         type: number
 *                         format: float
 *                         description: The amount of precipitation recorded.
 *                         example: 0.01
 *       400:
 *         description: The dateTime format has to be YYYYMMDDHHMMSS
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid datetime format."
 *       404:
 *         description: No data found for the specified device and date/time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No data found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve data"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

weatherRouter.get("/:deviceName/:dateTime", auth(["Teacher", "User", "Sensor"]), getDataByDeviceAndDateTime);

/**
 * @openapi
 * /weather/max-temp/{startDate}/{endDate}:
 *   get:
 *     summary: Get Maximum Temperature Data by Date Range
 *     tags: [Weather]
 *     description: |
 *       Retrieves the maximum temperature recorded for each device within a specified date range.
 *       Returns the device name, reading date/time, and the temperature value.
 *     parameters:
 *       - name: startDate
 *         in: path
 *         required: true
 *         description: The start date of the range (YYYYMMDD). *Required*
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *           example: "20200801"
 *       - name: endDate
 *         in: path
 *         required: true
 *         description: The end date of the range (YYYYMMDD). *Required*
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *           example: "20200831"
 *     responses:
 *       200:
 *         description: Successfully retrieved maximum temperature data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Data successfully retrieved"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                         example: "Test_Sensor"
 *                       readingDateTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2020-08-02T10:00:00Z"
 *                       temperature:
 *                         type: number
 *                         format: float
 *                         example: 35.5
 *       400:
 *         description: Bad request due to invalid or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Start date and end date are required"
 *       404:
 *         description: No data found for the specified date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "No data found for the specified date range"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Database query failed"
 *                 error:
 *                   type: string
 *                   example: "Error message details"
 */

weatherRouter.get("/max-temp/:startDate/:endDate", auth(["Teacher", "User", "Sensor"]), getMaxTempDataByStartDateAndEndDate);


export default weatherRouter;
