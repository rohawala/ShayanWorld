import mongoose from "mongoose";
import Joi from "joi";
import JoiPhoneNumber from "joi-phone-number";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  user_type: {
    type: String,
  },
  username: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  password: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default:false
  },
  description: {
    type: String,
    default:""
  },
  OtpSended:{
    type:Number,
    default:0
  },
  otp: {
    type: String,
  },

  createdAt:{
    type:Date,
    default:Date.now
  }
});

let User = mongoose.model("User", userSchema);
const customJoi = Joi.extend(JoiPhoneNumber);
const phoneSchema = customJoi.string().phoneNumber();


const userValidationSchema = Joi.object({
  fullname: Joi.string().required(),
  phoneNumber: phoneSchema,
  isVerified: Joi.boolean().default(false),
  password: Joi.string().required(),
  username: Joi.string().required(),
  user_type: Joi.string().required(),
  image: Joi.required()
});

const userVerificationValidation=Joi.object({
    phoneNumber:phoneSchema,
    otp:Joi.any().required()  
})
const login_validation=Joi.object({
  phoneNumber:phoneSchema,
  password:Joi.string().required()  
})


export { User, userValidationSchema,userVerificationValidation,login_validation };