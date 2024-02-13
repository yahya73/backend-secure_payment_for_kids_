import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import { google } from 'googleapis';

export const registerPartenaire = async (req, res) => {
    try {
        const { Username, Email, Password, PhoneNumber } = req.body;

        // Vérifier si le partenaire existe déjà
        const existingPartenaire = await UserModel.findOne({ Username });

        if (existingPartenaire) {
            return res.status(400).json({ message: "Partenaire already exists", partenaire: existingPartenaire });
        }        

        const existingEmail = await UserModel.findOne({ Email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(Password, 10);

        const newPartenaire = new UserModel({
            Username,
            Email,
            Password: hashedPassword,
            Role: 'partner',
            image: 'default image', 
            PhoneNumber,
            AdressBlockchain: 'static blockchain address', 
            ProhibitedProductTypes: ['type1', 'type2'],
            Verified : false
        });

        const partenaire = await newPartenaire.save();

        const token = jwt.sign(
            { username: partenaire.Username, id: partenaire._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );        

        // Send verification email
        await sendVerificationEmail(Email, Username);

        res.status(200).json({ partenaire, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const sendVerificationEmail = async (email, username) => {
    try {

        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
          );
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
        console.log("Access token:", ACCESS_TOKEN);

        // Create nodemailer transporter with OAuth2 authentication
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });

        // Define email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Email',
            html: `Hey ${username}, click <a href="http://localhost:9090/partenaire/verifyEmail/${email}">here</a> to verify your email.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const email = req.params.email;
        
        // Find the user by email and update the Verified field to true
        const user = await UserModel.findOneAndUpdate(
            { Email: email }, 
            { Verified: true }, 
            { new: true, projection: { Username: 1, Email: 1, Role: 1, Verified: 1 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Email ${email} verified`);
        res.status(200).json({ message: 'User verified with success', user }); // Respond with success message and user
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};






export const registerParent = async (req, res) => {
    try {
        const { Username, Email, Password, PhoneNumber } = req.body;

        // Vérifier si le partenaire existe déjà
        const existingParent = await UserModel.findOne({ Username });

        if (existingParent) {
            return res.status(400).json({ message: "User already exists", parent: existingParent });
        }        

        const existingEmail = await UserModel.findOne({ Email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(Password, 10);

        const newParent = new UserModel({
            Username,
            Email,
            Password: hashedPassword,
            Role: 'parent',
            image: 'default image', 
            PhoneNumber,
            AdressBlockchain: 'static blockchain address', 
            ProhibitedProductTypes: ['type1', 'type2'],
            Verified : false
        });

        const parent = await newParent.save();

        const token = jwt.sign(
            { username: parent.Username, id: parent._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );        

        // Send verification email
        await sendVerificationEmail(Email, Username);

        res.status(200).json({ parent, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};