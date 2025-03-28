const mongoose = require('mongoose');

// Connect to MongoDB first
mongoose.connect('mongodb://127.0.0.1:27017/chatbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Define a more specific schema for chat messages
const chatMessageSchema = new mongoose.Schema({
    user_input: String,
    response: String,
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

const userSchema = new mongoose.Schema({
    email: String,
    nickname: String,
    previousRequests: [chatMessageSchema], // Use the specific schema
    firstSignedDate: { 
        type: Date, 
        default: Date.now 
    },
});

const User = mongoose.model('Signed_Users', userSchema);

async function createUser(email, nickname){
    try{
        if(!email) {
            throw new Error("Email is required");
        }
        
        const userDetail = await User.findOne({ email: email });
        
        if(userDetail){
            console.log("User already exists");
            return userDetail;
        }
        else{
            const newUser = new User({
                email: email,
                nickname: nickname || email.split('@')[0],
                previousRequests: [],
            });
            
            const savedUser = await newUser.save();
            console.log("User created successfully");
            return savedUser;
        }
    } catch(error){
        console.error("Error creating user:", error);
        throw error;
    }
}

async function saveChat(email, chat){
    try{
       console.log("saveChat function called with email:", email);
       console.log("Chat data:", JSON.stringify(chat, null, 2));
       
       
       if (chat.timestamp && !(chat.timestamp instanceof Date)) {
           chat.timestamp = new Date(chat.timestamp);
       }
       
       const userDetail = await User.findOne({ email: email });
       if(userDetail){
           console.log("User found in database:", userDetail.email);
           
           console.log("Updating user document with new chat");
           const updateResult = await User.updateOne(
               { email: email },
               { $push: { previousRequests: chat }}
           );
           
           console.log("MongoDB update result:", updateResult);
           console.log("Chat saved successfully");
           return true;
       } else{
           console.log("User not found in database for email:", email);
           return false;
       }
    }catch(error){
        console.error("Error in saveChat function:", error);
        throw error;
    }
}

async function getChatHistory(email) {
    try {
        console.log("getChatHistory function called with email:", email);
        
        if (!email) {
            throw new Error("Email is required");
        }
        
        const userDetail = await User.findOne({ email: email });
        
        if (userDetail && userDetail.previousRequests) {
            return userDetail.previousRequests; 
        } else {
            console.log("User not found or no chat history for email:", email);
            return [];
        }
    } catch (error) {
        console.error("Error getting chat history:", error);
        throw error;
    }
}

module.exports = { User, createUser, saveChat, getChatHistory };