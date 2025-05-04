import { Router } from "express";
import { createUser, deleteUserById, getAllUsersData, getUserByAuthenticationKey, getUserById, updateUserById, deleteManyByDateRange, updateManyUserRoles } from "../controllers/users.js";
import auth from "../middleware/auth.js"


const userRouter = Router();

/**
 * @openapi
 * /users:
 *  post:
 *      summary: Create User
 *      tags: [Users]
 *      security:
 *        - ApiKey: [] 
 *      requestBody:
 *          $ref: "#/components/requestBodies/NewUser"
 *      responses:
 *          201:
 *              $ref: "#/components/responses/201_UserCreated"
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
 *                                example: "Invalid user data provided."
 *          401:
 *              $ref: "#/components/responses/401_Unauthorized"
 *          403:
 *              $ref: "#/components/responses/403_Forbidden"    
 *          409:
 *              description: Email address already associated with another account.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                type: integer
 *                                example: 409
 *                              message:
 *                                type: string
 *                                example: "Email account already associated with another account."
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
userRouter.post("/", auth(["Teacher"]), createUser);

/**
 * @openapi
 * /users/{id}:
 *  get:
 *      summary: Get user by ID
 *      tags: [Users]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: User ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_UserObject"
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
 *                                example: "Invalid user ID provided."
 *          401:
 *              $ref: "#/components/responses/401_Unauthorized"
 *          403:
 *              $ref: "#/components/responses/403_Forbidden"    
 *          404:
 *              description: User not found
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
 *                                  example: "User not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
userRouter.get("/:id", auth(["Teacher"]), getUserById);

/**
 * @openapi
 * /users/key/{authenticationKey}:
 *    get:
 *      summary: Get user by authentication key
 *      tags: [Users]
 *      parameters:
 *        - name: authenticationKey
 *          in: path
 *          description: User authentication key
 *          required: true
 *          schema:
 *              type: string
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_UserObject"
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
 *                                example: "Invalid authentication key provided."
 *          403:
 *            $ref: "#/components/responses/403_Forbidden" 
 *          404:
 *              description: User not found
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
 *                                  example: "User not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
userRouter.get("/key/:authenticationKey", auth(["Teacher"]), getUserByAuthenticationKey);

/**
 * @openapi
 * /users/{id}:
 *  put:
 *      summary: Update User
 *      tags: [Users]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *        - name: id
 *          in: path
 *          description: User ID
 *          required: true
 *          schema:
 *            type: string 
 *            example: 66ce6ded27c21f99c5c8afe2
 *      requestBody:
 *          description: Updated user object
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                              example: 66ce6ded27c21f99c5c8afe2
 *                          email:
 *                              type: string
 *                              format: email
 *                              example: updatedUser@test.com
 *                          password:
 *                              type: string
 *                              format: password
 *                              example: UpdatedPassword123!
 *                          role:
 *                              type: string
 *                              enum:
 *                                - Teacher
 *                                - User
 *                                - Sensor
 *                          authenticationKey:
 *                              type: string
 *                              nullable: true
 *                              example: ""
 *      responses:
 *          200:
 *              $ref: "#/components/responses/200_UserObject"
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
 *                                example: "Invalid user data provided."         
 *          401:
 *              $ref: "#/components/responses/401_Unauthorized" 
 *          403:
 *              $ref: "#/components/responses/403_Forbidden"     
 *          404:
 *              description: User not found
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
 *                                  example: "User not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
userRouter.put("/:id", auth(["Teacher"]), updateUserById);

/**
* @openapi
*  /users:
*   patch:
*      summary: Update user roles based on a date range
*      description: Updates the roles of users created within a specified date range.
*      tags: [Users]
*      security:
*        - ApiKey: []
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                startDate:
*                  type: string
*                  pattern: '^\d{8}$'
*                  example: "20240828"
*                  description: The start date of the date range to filter users.
*                endDate:
*                  type: string
*                  pattern: '^\d{8}$'
*                  example: "20240828"
*                  description: The end date of the date range to filter users.
*              required:
*                - startDate
*                - endDate
*      responses:
*        200:
*          description: Successful update of user roles
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  matchedCount:
*                    type: integer
*                    description: The number of documents matched by the filter.
*                  modifiedCount:
*                    type: integer
*                    description: The number of documents modified.
*        400:
*          description: Bad request due to missing or invalid parameters
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  error:
*                    type: string
*                    description: Error message explaining the issue.
*        401:
*          description: Unauthorized request
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  error:
*                    type: string
*                    description: Error message explaining the authorization issue.
*        403:
*          $ref: "#/components/responses/403_Forbidden"    
*        500:
*          description: Internal server error
*          content:
*            application/json:
*              schema:
*                type: object
*                properties:
*                  error:
*                    type: string
*                    description: Error message explaining the server issue.
*/
userRouter.patch("/", auth(["Teacher"]), updateManyUserRoles)

/**
 * @openapi
 * /users/{id}:
 *  delete:
 *      summary: Delete User
 *      tags: [Users]
 *      security:
 *        - ApiKey: []
 *      parameters:
 *          - name: id
 *            in: path
 *            description: User ID
 *            required: true
 *            schema:
 *               type: string
 *      responses:
 *          200:
 *              description: User successfully deleted
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
 *                                  example: "User successfully deleted"
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
 *                                example: "Invalid user ID provided."
 *          401:
 *              $ref: "#/components/responses/401_Unauthorized"
 *          403:
 *              $ref: "#/components/responses/403_Forbidden"    
 *          404:
 *              description: User not found
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
 *                                  example: "User not found"
 *          500:
 *              $ref: "#/components/responses/500_DatabaseError"
 */
userRouter.delete("/:id", auth(["Teacher"]), deleteUserById);

/**
 * @openapi
 * /users:
 *  get:
 *      summary: Get All Users Data
 *      tags: [Users]
 *      security:
 *        - ApiKey: []
 *      responses:
 *        200:
 *          description: Response object with users data array
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
 *                    example: Get all users data
 *                  usersData:
 *                    type: array
 *                    items:
 *                      $ref: "#/components/schemas/User"
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
 *          description: Not Authorised
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: integer
 *                    example: 403
 *                  message:
 *                    type: string
 *                    example: Not Authorised
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

userRouter.get('/',auth(["Teacher"]), getAllUsersData)


/**
 * @openapi
 * /users/deleteManyByDateRange:
 *   delete:
 *     summary: Delete Multiple Users
 *     tags:
 *       - Users
 *     security:
 *       - ApiKey: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: start date
 *         required: true
 *         schema:
 *           type: string
 *           example: "20240813"
 *       - name: endDate
 *         in: query
 *         description: end date
 *         required: true
 *         schema:
 *           type: string
 *           example: "20240822"
 *     responses:
 *       200:
 *         description: Users successfully deleted
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
 *                   example: "X users deleted successfully."
 *       400:
 *         description: Bad Request
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
 *                   example: "Both startDate and endDate query parameters are required."
 *       401:
 *         $ref: "#/components/responses/401_Unauthorized"
 *       403:
 *         $ref: "#/components/responses/403_Forbidden"    
 *       500:
 *         $ref: "#/components/responses/500_DatabaseError"
 */

userRouter.delete('/deleteManyByDateRange', auth(["Teacher"]), deleteManyByDateRange)

export default userRouter;
