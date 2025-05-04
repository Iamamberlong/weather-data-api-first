import bcrypt from "bcryptjs";
import { v4 as uuid4 } from "uuid";
import * as Users from "../models/user.js";

/**
 * Controller for: POST /auth/login
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function loginUser(req, res) {
    try {
        const loginData = req.body;

        const user = await Users.getByEmail(loginData.email);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found."
            })
        }

        const isPasswordCorrect = bcrypt.compareSync(loginData.password, user.password)

        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 401,
                message: "Incorrect password."
            })
        }

        if (user && bcrypt.compareSync(loginData.password, user.password)) {
        // if (user && loginData.password == user.password) {
            user.authenticationKey = uuid4().toString();
            user.lastLogin = new Date(); // Use the current date and time

            // Save the updated user document
      
            await Users.update(user);
          
            res.status(200).json({
                status: 200,
                message: "User logged in",
                authenticationKey: user.authenticationKey,
            });
        } else {
            res.status(401).json({
                status: 401,
                message: "Invalid credentials",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Login failed",
        });
    }
}

/**
 * Controller for: POST /auth/logout
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function logoutUser(req, res) {
    try {
        const authenticationKey = req.body.authenticationKey;

        const user = await Users.getByAuthenticationKey(authenticationKey);

        if (user) {
            user.authenticationKey = null;
            await Users.update(user);

            res.status(200).json({
                status: 200,
                message: "User logged out",
            });
        } else {
            res.status(400).json({
                status: 400,
                message: "Invalid authentication key",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Failed to logout user",
        });
    }
}

/**
 * Controller for: POST /auth/register
 * @param {Request} req The Request Object
 * @param {Response} res The Response Object
 */
export async function registerUser(req, res) {
    try {
        const userData = req.body;

        const userAlreadyExists = await Users.getByEmail(userData.email);

        if (userAlreadyExists) {
            res.status(409).json({
                status: 409,
                message: "The provided email address is already associated with an account.",
            });
            return;
        }

        userData.password = bcrypt.hashSync(userData.password);

        const user = Users.User(
            null,
            userData.email,
            userData.password,
            "Teacher",
           
        );

        await Users.create(user);

        res.status(200).json({
            status: 200,
            message: "Registration successful",
            user: user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Registration failed",
        });
    }
}
