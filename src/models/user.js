import { ObjectId } from "mongodb";
import { db } from "../database.js";

/**
 * Create a new user model object
 *
 * @param {String | ObjectId | null} _id - MongoDB object ID for this user
 * @param {String} email - Email address associated with the user account (used for login)
 * @param {String} password - Password associated with the user account (used for login)
 * @param {String} role - Access role for use by authorization logic (e.g., teacher, user, sensor)
 * @param {String} authenticationKey - Key used to authenticate user requests
 * @param {Date} lastLogin - Timestamp of the last login
 * @returns {Object} - The user model object
 */
export function User(_id, email, password, role, createdAt, authenticationKey, lastLogin) {
    return {
        _id: _id ? new ObjectId(_id) : null,
        email,
        password,
        role,
        createdAt: createdAt ? new Date(createdAt) : new Date(), // Use provided createdAt if available
        authenticationKey,
        lastLogin: lastLogin ? new Date(lastLogin) : new Date() // Use provided lastLogin or default to null
    };
}

/**
 * Insert the provided user into the database
 *
 * @param {Object} user - User to insert
 * @returns {Promise<InsertOneResult>} - The result of the insert operation
 */
export async function create(user) {
    delete user._id;
    return db.collection("users").insertOne(user);
}

/**
 * Get a specific user by their ObjectId
 *
 * @param {ObjectId} id - MongoDB ObjectId of the user to get
 * @returns {Promise<Object>} - A promise for the matching user
 */
export async function getUserById(id) {
    return db.collection("users").findOne({ _id: new ObjectId(id) });
}

/**
 * Get a specific user by their email address
 *
 * @param {String} email - Email address of the user
 * @returns {Promise<Object>} - A promise for the matching user
 */
export async function getUserByEmail(email) {
    return db.collection("users").findOne({ email });
}

/**
 * Get a specific user by their authentication key
 *
 * @param {String} key - Authentication key
 * @returns {Promise<Object>} - A promise for the matching user
 */
export async function getUserByAuthenticationKey(key) {
    return db.collection("users").findOne({ authenticationKey: key });
}

/**
 * Update the provided user in the database
 *
 * @param {Object} user - User to update
 * @returns {Promise<UpdateResult>} - The result of the update operation
 */
export async function update(user) {
    const userWithoutId = { ...user };
    delete userWithoutId._id;
    return db.collection("users").replaceOne({ _id: new ObjectId(user._id) }, userWithoutId);
}

/**
 * Updates the roles of multiple users in the database based on a date range.
 * @param {Date} startDate - The start date of the date range.
 * @param {Date} endDate - The end date of the date range.
 * @returns {Promise} - A promise that resolves when the operation is complete.
 */
export async function updateManyUserRoles(startDate, endDate) {
    // Validate inputs
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        throw new Error('startDate and endDate must be valid Date objects.');
    }

    // Define the default roles to be set


    // Perform the updateMany operation with a date range filter
    return db.collection('users').updateMany(
        { createdAt: { $gte: startDate, $lte: endDate } }, // Date range filter
        { $set: { role: "Teacher" } } // Default update operation
    );
}


/**
 * Delete a specific user by their ObjectId
 *
 * @param {ObjectId} id - MongoDB ObjectId of the user to delete
 * @returns {Promise<DeleteResult>} - The result of the delete operation
 */
export async function deleteById(id) {
    return db.collection("users").deleteOne({ _id: new ObjectId(id) });
}

/**
 * Delete Multiple role = User if lastLogin fall in a startDate and endDate
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */

export async function deleteManyByStartDateEndDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate)

    try {
        const criteria = {
            role: "User",
            lastLogin: {$gte: start, $lte: end},
        }

        console.log("criteria is: ", criteria)
        const result = await db.collection("users").deleteMany(criteria)
        console.log("result is: ", result)
        return result
        
    } catch (error) {
        console.error("Error in deleteUserByStartDateEndDate: ", error)
        throw error
    }
}


/**
 * Get all users
 *
 * @returns {Promise<Object[]>} - A promise for the array of all users
 */
export async function getAll() {
    return db.collection("users").find().limit(10).toArray();
}

/**
 * Delete multiple users by role and last login date range
 *
 * @param {String} role - Role of the users to delete
 * @param {Date} start - Start date (inclusive)
 * @param {Date} end - End date (inclusive)
 * @returns {Promise<DeleteResult>} - The result of the delete operation
 */
export async function deleteUsersByRoleAndLastLogin(role, start, end) {
    return db.collection("users").deleteMany({
        role,
        lastLogin: {
            $gte: new Date(start),
            $lte: new Date(end)
        }
    });
}

/**
 * 
 * @param {*} userId 
 * @returns 
 */
export async function updateLastLogin(userId) {

    return db.collection("users").updateOne(
   
      { _id: new ObjectId(userId) },
      { $set: { lastLogin: new Date() } }
    );
  }

/**
 * Get a specific user by their ObjectId
 *
 * @export
 * @async
 * @param {ObjectId} id - mongoDB ObjectId of the user to get
 * @returns {Promise<Object>} - A promise for the matching user
 */
export async function getById(id) {
    // attempt to find the first matching user by id
    let user = await db.collection("users").findOne({ _id: new ObjectId(id) })

    // check if a user was found and handle the result
    if (user) {
        return user
        console.log('The found user is', user)
    } else {
        return Promise.reject("user not found with id " + id)
    }
}


/**
 * 
 * @param {String} key 
 * @returns 
 */
  export async function getByAuthenticationKey(key) {
    try {
        // attempt to find the first matching user by authentication key
        let user = await db.collection("users").findOne({ authenticationKey: key });

        // check if a user was found and handle the result
        if (user) {
            return user;
        } else {
            // do not return authentication key in error for security reasons
            throw new Error("user not found");
        }
    } catch (error) {
        return Promise.reject(error.message);
    }
}

/**
 * Get a specific user by their email address
 *
 * @export
 * @async
 * @param {ObjectId} email - email address of the user
 * @returns {Promise<Object>} - A promise for the matching user
 */
export async function getByEmail(email) {
    // attempt to find the first matching user by email
    let user = await db.collection("users").findOne({ email: email })

    // check if a user was found and handle the result
    if (user) {
        return user
    } else {
        return null
    }
}

