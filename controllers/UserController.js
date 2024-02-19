import User from "../models/User.js";
import bcrypt from 'bcrypt';

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
