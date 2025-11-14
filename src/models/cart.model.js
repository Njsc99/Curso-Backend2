import mongoose from 'mongoose';

const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1
        }
    }]
}, { timestamps: true });

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;