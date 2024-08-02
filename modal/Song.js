import mongoose from "mongoose";
import Joi from "joi";

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    username:{
        type:mongoose.Schema.Types.String,
        ref: 'User', // Reference to the User model
        required: true
    },
    deliver_status:{
        type:mongoose.Schema.Types.String,
        ref: 'Order', // Reference to the User model
        
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

let Song = mongoose.model('Song', songSchema);

// module.exports = Song;
export {Song}
