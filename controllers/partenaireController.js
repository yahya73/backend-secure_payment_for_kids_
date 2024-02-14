import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails

export const registerPartenaire = async (req, res) => {
    try {
        const { Username, Email, Password, PhoneNumber } = req.body;

        // Vérifier si le partenaire existe déjà
        const existingPartenaire = await UserModel.findOne({ Username });

        if (existingPartenaire) {
            return res.status(400).json({ message: "Partenaire already exists", partenaire: existingPartenaire });
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
            Verified : false,
            banned:false
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

// Function to send verification email
const sendVerificationEmail = async (email, username) => {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        // Configure transporter options (e.g., SMTP settings)
        // For example, if using Gmail:
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verification Email',
        text: `Hey ${username}, click this link to verify your email <br><a href="http://localhost:9090/partenaire/verifyEmail/${email}">here</a>`
        // You can also use HTML in the text field for a styled email
    };

    // Send the email
    await transporter.sendMail(mailOptions);
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


