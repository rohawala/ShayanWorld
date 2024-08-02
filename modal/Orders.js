import mongoose from "mongoose";
import Joi from "joi";
import JoiPhoneNumber from "joi-phone-number";

const userSchema = new mongoose.Schema({
    customer_id: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    songId: {
      type:mongoose.Schema.Types.ObjectId,
      ref: 'Song', // Reference to the User model
      required: true,
    },
    createdAt:{
      type:Date,
      default:Date.now
    },
    deliver_status:{
      type:String,
      default: "Request"
    },
    Songname:{
      type:mongoose.Schema.Types.String,
      ref: 'Song', // Reference to the User model
      required: true,
    },
    customerUsername:{
      type:mongoose.Schema.Types.String,
      ref: 'User', // Reference to the User model
      required: true,
    },
    duration:{
      type:mongoose.Schema.Types.Number,
      ref: 'Song', // Reference to the User model
      required: true,
    },
    djUsername:{
      type:mongoose.Schema.Types.String,
      ref: 'User', // Reference to the User model
      required: true,
    },
    djId:{
      type:mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true, 
    }
});

let Order = mongoose.model("Order", userSchema);
// const customJoi = Joi.extend(JoiPhoneNumber);
// const phoneSchema = customJoi.string().phoneNumber();

const OrderValidationSchema = Joi.object({
  customer_id: Joi.string().required(),
  songId:Joi.string().required(),
  deliver_status:Joi.string().required(),
});




export { Order, OrderValidationSchema };