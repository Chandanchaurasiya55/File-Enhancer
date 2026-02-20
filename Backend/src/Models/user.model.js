const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Fullname: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minlength: [3, "Full name must be at least 3 characters"]
    },
    Email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },
    Phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"]
    },
    Password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"]
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Clean up stale username index
User.collection.dropIndex('username_1').catch(() => {
    // Index doesn't exist, that's fine
});

module.exports = User;
