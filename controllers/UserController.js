import User from "../models/User.js";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
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
const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 8); // Generate a random 6-character alphanumeric code
};

// Function to send the password reset email
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body; // Assuming you're sending the email address in the request body

  try {
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.Verified === false) {
      return res.status(401).json({ error: "User not verified" });
    }

    // Generate a random code for password reset
    const resetCode = generateRandomCode();

    // Update the user document in the database with the reset code
    user.ResetCode = resetCode;
    await user.save();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'mootez202@gmail.com', // Your Gmail email address
        pass: 'ylaq roin svpz colq ' // Your Gmail password
      }
    });

    // Email message options
    const mailOptions = {
      from: 'mootez202@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your password reset code is: ${resetCode}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Password reset email sent successfully', resetCode });
      }
    });
  } catch (error) {
    console.log('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Controller function to reset the password
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.Password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export { sendPasswordResetEmail,resetPassword };
