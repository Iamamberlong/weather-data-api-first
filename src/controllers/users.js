import bcrypt from "bcryptjs"
import * as Users from "../models/user.js"
import express from "express"
import { ObjectId } from 'mongodb'
import { validate as isUUID} from 'uuid'


export async function getAllUsersData(req, res) {
    const usersData = await Users.getAll();
    console.log("usersData.createdAt is a type of:", typeof(usersData.createAt))
    console.log("usersData is: ", usersData)
    const authenticationKey = req.get("X-AUTH-KEY");
    const currentUser = await Users.getByAuthenticationKey(authenticationKey);

    if (currentUser.role !== "Teacher") {
        return res.status(403).json({
          status: 403,
          message: "You are not authorized to perform the operation.",
        });
      }

    const formatDate = (date) => {
        if (date instanceof Date) {
            return date.toISOString();
        } else if (typeof date === 'string') {
            const parsedDate = new Date(date);
            return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
        }
        return null; // Handle cases where date is null or undefined
    };

    // Format the users data
    const formattedUsers = usersData.map(user => ({
        _id: user._id.toString(), // Convert ObjectId to string
        email: user.email,
        password: user.password, // Be cautious with sending passwords; usually, you shouldn't include them in responses
        role: user.role,
        createdAt: formatDate(user.createdAt), // Convert Date to ISO string
        authenticationKey: user.authenticationKey || null,
        lastLogin: user.lastLogin ? formatDate(user.lastLogin) : formatDate(user.createdAt) // Convert Date to ISO string or set null
    }));

    console.log("formatted users are:", formattedUsers)

    res.status(200).json({
        status: 200,
        message: "Get all user data",
        usersData: formattedUsers,
    })
}
/**
 * Controller for creating a new user
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function createUser(req, res) {
    const userData = req.body;
    const authenticationKey = req.get("X-AUTH-KEY");
    const currentUser = await Users.getByAuthenticationKey(authenticationKey);

    if (currentUser.role !== "Teacher") {
        return res.status(403).json({
          status: 403,
          message: "You are not authorized to perform the operation.",
        });
      }

    if (!userData.email || !userData.password || !userData.role) {
        return res.status(400).json({
            status: 400,
            message: "Email, password and role are required."
        })
    }

    // Hash the password before storing in the database
    userData.password = bcrypt.hashSync(userData.password);
 

    // Create a new User model object
    const user = Users.User(
        null, // Assuming User constructor handles null/undefined for _id
        userData.email,
        userData.password,
        userData.role,
        userData.createdAt,
        null, // Assuming no initial authenticationKey on user creation
        userData.lastLogin
    );

    // Save the user to the database
    try {
        const existingUser = await Users.getByEmail(userData.email)
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: "Email already exists."
            })
        }
        const newUser = await Users.create(user);
        res.status(201).json({
            status: 201,
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to create user",
        });
    }
}

/**
 * Controller for: GET /users/key/:authenticationKey
 * @param {express.Request} req The Request object
 * @param {express.Response} res The Response object
 */
export async function getUserByAuthenticationKey(req, res) {
    const authenticationKey = req.params.authenticationKey;

    if (!authenticationKey) {
        res.status(400).json({
            status: 400,
            message: "Bad Request: Authentication key parameter required."
        });
        return;
    }

    if (!isUUID(authenticationKey)) {
        return res.status(400).json({
            status: 400,
            message: "Invalid authentication key format. Must be a valid UUID."
        })
    }

    try {
        const user = await Users.getByAuthenticationKey(authenticationKey);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found with the provided authentication key."
            })
        }
        const formattedUser = {
            _id: user._id.toString(), // Convert ObjectId to string
            email: user.email,
            password: user.password, // Be cautious with sending passwords; usually, you shouldn't include them in responses
            role: user.role,
            createdAt: user.createdAt,
            authenticationKey: user.authenticationKey,
            lastLogin: user.lastLogin };
        
            res.status(200).json({
                status: 200,
                message: "Get user by authentication key",
                user: formattedUser,
            });
        
    } catch (error) {
        console.error("Error fetching user by authentication key:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to get user by authentication key",
            error: error.message
        });
    }
}

/**
 * Controller for retrieving a user by ID
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function getUserById(req, res) {
    const userId = req.params.id;
    console.log("userId is:", userId)
    console.log("type of userId is:",  typeof(userId))

    if (!userId || userId.length !== 24) {
        return res.status(400).json({
            status: 400,
            message: "User ID must be a 24-character hexadecimal string."
        });
    }

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
            status: 400,
            message: "Invalid user ID format."
        });
    }

    const objectId = new ObjectId(userId)



    try {
        const user = await Users.getById(objectId);
        console.log("The user with id is:", user)
        if (!user) {
            res.status(404).json({
                status: 404,
                message: "User not found",
            });
        } else {
            const formattedUser = {
                _id: user._id.toString(), // Convert ObjectId to string
                email: user.email,
                password: user.password, // Be cautious with sending passwords; usually, you shouldn't include them in responses
                role: user.role,
                createdAt: user.createdAt,
                authenticationKey: user.authenticationKey,
                lastLogin: user.lastLogin };

            res.status(200).json({
                status: 200,
                message: "User found",
                user: formattedUser,
            });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch user",
        });
    }
}

/**
 * Controller for updating a user by ID
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function updateUserById(req, res) {
    const userId = req.params.id;
    console.log("req.params:", req.params)
    console.log("userId is :", userId)
    const updateData = req.body;

    if (!userId || userId.length !== 24) {
        return res.status(400).json({
            status: 400,
            message: "User ID must be a 24-character hexadecimal string."
        });
    }

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
            status: 400,
            message: "Invalid user ID format."
        });
    }

    updateData._id = new ObjectId(userId)
 

    try {
        // Fetch the existing user
        let user = await Users.getById(userId);
        if (!user) {
            res.status(404).json({
                status: 404,
                message: "User not found",
            });
            return;
        }

        // Update user data
        user = { ...user, ...updateData };

        // Save updated user to the database
        const updatedUser = await Users.update(user);
        console.log("updated users is:", updatedUser)
        res.status(200).json({
            status: 200,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to update user",
        });
    }
}


/**
 * Controller for deleting a user by ID
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function deleteUserById(req, res) {
    const userId = req.params.id;

    if (!userId || userId.length !== 24) {
        return res.status(400).json({
            status: 400,
            message: "User ID must be a 24-character hexadecimal string."
        });
    }

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({
            status: 400,
            message: "Invalid user ID format."
        });
    }
    const objectId = new ObjectId(userId)

    try {
        // Fetch the existing user
        const user = await Users.getById(objectId);
        if (!user) {
            res.status(404).json({
                status: 404,
                message: "User not found",
            });
            return;
        }

        // Delete the user from the database
        await Users.deleteById(objectId);
        res.status(200).json({
            status: 200,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to delete user",
        });
    }
}

export async function deleteManyByDateRange(req, res) {
    const { startDate, endDate } = req.query
    console.log("startDate is: ", startDate)

    if (!startDate || !endDate) {
        return res.status(400).json({
            status: 400,
            message: "Both startDate and endDate query parameters are required."
        })
    }

    // const start = new Date(`${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`);
    // const end = new Date(`${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}`);

    const isoStartDate = new Date(
        `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}T00:00:00.000Z`
    );
    const isoEndDate = new Date(
        `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}T23:59:59.999Z`
    );

    console.log("iso startDate and endDate are: ", isoStartDate, isoEndDate);
    
      if (isNaN(isoStartDate.getTime()) || isNaN(isoEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
    try {
        const result = await Users.deleteManyByStartDateEndDate(isoStartDate, isoEndDate)
        console.log("result is like: ", result)

        res.status(200).json({
            status: 200,
            message: `${result.deletedCount} users deleted successfully.`
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to delete users."
        })
    }

}

/**
 * Controller function to update user roles based on a date range.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function updateManyUserRoles(req, res) {
    const { startDate, endDate } = req.body;

    // Validate request body
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required.' });
    }

    const isoStartDate = new Date(
        `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}T00:00:00.000Z`
    );
    const isoEndDate = new Date(
        `${endDate.slice(0, 4)}-${endDate.slice(4, 6)}-${endDate.slice(6, 8)}T23:59:59.999Z`
    );
    console.log("iso startDate and endDate are: ", isoStartDate, isoEndDate);
    
      if (isNaN(isoStartDate.getTime()) || isNaN(isoEndDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

    try {
        // Call the service function to update roles
        const result = await Users.updateManyUserRoles(isoStartDate, isoEndDate);
        console.log("result is: ", result)

        // Respond with the result
        res.status(200).json({
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ error: 'An error occurred while updating user roles.' });
    }
}



