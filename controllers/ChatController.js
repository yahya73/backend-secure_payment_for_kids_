import Chat from "../models/chat.js";
import Room from "../models/Room.js";

export async function sendMessage(req, res) {
    try {
        const { username, text, image } = req.body;
        
        // Create a new chat message
        const newChatMessage = new Chat({
            username,
            text,
            image
        });

        // Save the chat message to the database
        await newChatMessage.save();

        res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getRoomMessages(req, res) {
    try {
        const { buyer_username, seller_username } = req.body;

        // Fetch messages for the specified room
        const roomMessages = await Chat.find({
            $or: [
                { username: buyer_username },
                { username: seller_username }
            ]
        }).exec();

        res.status(200).json(roomMessages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}

export async function getRooms(req, res) {
    try {
        const { username } = req.params;

        // Fetch rooms for the specified username
        const rooms = await Room.find({
            $or: [
                { buyer_username: username },
                { seller_username: username }
            ]
        }).exec();

        res.status(200).json(rooms);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
