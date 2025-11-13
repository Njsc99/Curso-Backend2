import mongoose from 'mongoose';

const userCollection = "users";

const userSchema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required: true 
    },
    last_name: { 
        type: String, 
        required: false,
        default: ""
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    age: { 
        type: Number, 
        default: 18
    },
    password: { 
        type: String, 
        required: false,
        default: ""
    },
    role: {
        type: String,
        default: 'user'
    },
    provider: {
        type: String,
        default: 'local'
    }
}, { timestamps: true });

// ✅ Define y exporta el modelo
const userModel = mongoose.model(userCollection, userSchema);

export default userModel;