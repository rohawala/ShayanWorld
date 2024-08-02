import mongoose from "mongoose";
import Joi from "joi";

const RequestsongSchema = new mongoose.Schema({
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
        // required: true
    },
    duration: {
        type: String,
        required: true
    },
    djId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status:{
        type:String,
        default:"pending"
    }
});

let Song_Request = mongoose.model('Song_Request', RequestsongSchema);

// module.exports = Song;
export {Song_Request}
