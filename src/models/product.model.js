import mongoose from 'mongoose';

const productCollection = "products";

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    stock: { 
        type: Number, 
        required: true,
        min: 0,
        default: 0
    },
    category: { 
        type: String, 
        required: true 
    },
    code: { 
        type: String, 
        required: true,
        unique: true
    },
    owner: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

const productModel = mongoose.model(productCollection, productSchema);

export default productModel;
