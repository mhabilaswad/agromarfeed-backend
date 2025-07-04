const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wishlist_item: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);