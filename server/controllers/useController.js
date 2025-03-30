const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/chatbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

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
    previousRequests: [chatMessageSchema],
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
async function getChat(em){
    try{
        const userDetail = await User.findOne({ email: em });
        console.log("UserDetail:", userDetail);
        if(!userDetail){
            console.log("User not found in database");
            return 'ERROR';
        }
        return userDetail.previousRequests;
    }catch(error){
        console.error("Error in getChat function:", error);
        return 'ERROR';
    }
}


module.exports = { User, createUser, saveChat, getChat };