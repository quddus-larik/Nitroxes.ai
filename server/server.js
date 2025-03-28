require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createUser, saveChat, User, getChatHistory } = require("./controllers/useController");

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL}:generateContent`;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

app.post("/sign-in", async (req, res) => {
   try {
    const { email, nickname } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = await createUser(email, nickname);
    res.status(200).json({ success: true, user });
   } catch(error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ error: "Failed to process sign-in", message: error.message });
   }
});

app.post("/chat", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong", details: error.response?.data });
    }
});

app.post("/save-chat", async (req, res) => {
    try {
        const { email, chat } = req.body;
        console.log("Save chat request received for email:", email);
        console.log("Chat data received:", chat);
        
        if (!email || !chat) {
            console.log("Missing required fields:", { email: !!email, chat: !!chat });
            return res.status(400).json({ error: "Email and chat are required" });
        } 

        console.log("Calling saveChat function with data");
        const saved = await saveChat(email, chat);
        console.log("Save chat result:", saved);
        res.json({ success: saved });
    } catch (error) {
        console.error("Error in save-chat endpoint:", error);
        res.status(500).json({ error: "Something went wrong", details: error.message }); 
    }
});

app.get("/get-chat-history", async (req, res) => {
    try {
        const { email } = req.query; 
        if (!email) {
            return res.status(400).json({ error: "Email is required" });     
        }
        
        console.log("Fetching chat history for email:", email);
        const chatHistory = await getChatHistory(email);
        
        console.log("Returning chat history with", chatHistory.length, "messages");
        // Return in a consistent format that matches what the client expects
        res.json({ 
            previousRequests: chatHistory,
            count: chatHistory.length
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ error: "Something went wrong", details: error.message }); 
    } 
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
