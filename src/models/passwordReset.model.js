import mongoose from 'mongoose';

const passwordResetCollection = "passwordResets";

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hora
    },
    used: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index para expiración automática
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const passwordResetModel = mongoose.model(passwordResetCollection, passwordResetSchema);

export default passwordResetModel;
