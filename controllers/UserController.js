import User from "../models/User.js";
import bcrypt from 'bcrypt';
import {validationResult} from "express-validator";

export async function signin(req, res) {
  const { identifier, password } = req.body;

  try {
    console.log('Identifier:', identifier);
    console.log('password:', password);

    // Determine if the identifier is an email or a username
    let user = await User.findOne({
      $or: [
        { "Email": identifier },
        { "Username": identifier }
      ]
    });

    console.log('User:', user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}




export function getAll(req, res) {
    // Retrieve all tests from the database
    user.find()
        .then((users) => {
            // Respond with the array of tests
            res.json(users);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}

export function banUser(req, res) {
    // Check if there are validation errors
    if (!validationResult(req).isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        // If there are no validation errors, update the user by ID
        user.findByIdAndUpdate(
            req.params.id,
            {
                Banned:req.body.banned,
            },
            { new: true } // Return the updated user
        )
            .then((bannedUser) => {
                // Check if the user exists
                if (!bannedUser) {
                    return res.status(404).json({ message: 'user not found' });
                }
                // Respond with the updated user details
                res.json({
                    message:'user banned  successfully'
                });
            })
            .catch((err) => {
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
}
export function unbanUser(req, res) {
    // Check if there are validation errors
    if (!validationResult(req).isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        // If there are no validation errors, update the user by ID
        user.findByIdAndUpdate(
            req.params.id,
            {
                Banned:false,
            },
            { new: true } // Return the updated user
        )
            .then((bannedUser) => {
                // Check if the user exists
                if (!bannedUser) {
                    return res.status(404).json({ message: 'user not found' });
                }
                // Respond with the updated user details
                res.json({
                    message:'user unbanned  successfully'
                });
            })
            .catch((err) => {
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
}

