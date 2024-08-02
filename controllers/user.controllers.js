import { User, login_validation, userValidationSchema } from "../modal/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import getBytes from "../utils/getBytes.js";
import s3 from "../utils/s3.js";
import { Order, OrderValidationSchema } from "../modal/Orders.js";
import { Song } from "../modal/Song.js";
import {Song_Request} from '../modal/Request.js'
import mongoose from "mongoose";
function generateToken(user) {
  const token = jwt.sign(user, process.env.SECRETKEY, { expiresIn: "24h" });
  return token;
}
export const verifyUser = async (req, res) => {
  try {
    console.log(req.body);
    const phoneNumber = req.body.phoneNumber;
    console.log("phoneNumber: " + phoneNumber);
    const verifyUser = await User.findOneAndUpdate(
      { phoneNumber: phoneNumber }, // Specify the query object
      { isVerified: true },
      { new: true }
    );
    console.log("verified used  "+verifyUser)
    res.status(200).json(verifyUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const register = async (req, res) => {
  console.log(req.body)
  try {
    let user_type = "customer";

    console.log(req.body)
    const { error } = userValidationSchema.validate({
      ...req.body,
      user_type,
    });

    if (error) {
      // Log validation error details
      console.log("Validation error details:", error.details);
      let details = error.details.map((detail) => {
        return {
          field: detail.path.join("."),
          message: detail.message,
        };
      });
      return res.status(400).send({
        message: "Validation Failed",
        details,
      });
    }
    let { password, phoneNumber } = req.body;
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", status: false, exist: true });
    }

    let profilePicture;
    if (req.file) {
      const fileContent = req.file.buffer; // Access the file buffer
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:
          getBytes() + "" + new Date().getTime() + "" + req.file.originalname, // Set the key as the original filename
        Body: fileContent,
      };

      // Upload the file to S3 bucket
      const uploadResult = await s3.upload(params).promise();

      // Set the profilePicture field to the S3 URL
      profilePicture = uploadResult.Location;
      console.log("pic url "+profilePicture);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    req.body.password = hashedPassword;

    let otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    
    console.log(otp);
    var user = new User({ ...req.body, otp, user_type, profilePicture });
    await user.save();

    const userWithoutOtp = user.toObject();
    delete userWithoutOtp.otp;
    delete userWithoutOtp.password;

    let token = await generateToken(userWithoutOtp);
    res.status(200).json({
      status: true,
      message: "User Registered Successfully please verify otp",
      userWithoutOtp,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
export const register_dj = async (req, res) => {
  try {
    let user_type = "dj";
    const { error } = userValidationSchema.validate({
      ...req.body,
      user_type,
    });
    if (error) {
      let details = error.details.map((detail) => {
        return {
          field: detail.path.join("."),
          message: detail.message,
        };
      });
      return res.status(400).send({
        message: "Validation Failed",
        details,
      });
    }
    let { password, phoneNumber } = req.body;
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", status: false, exist: true });
    }
    let profilePicture;
    if (req.file) {
      const fileContent = req.file.buffer; // Access the file buffer
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key:
          getBytes() + "" + new Date().getTime() + "" + req.file.originalname, // Set the key as the original filename
        Body: fileContent,
      };

      // Upload the file to S3 bucket
      const uploadResult = await s3.upload(params).promise();

      // Set the profilePicture field to the S3 URL
      profilePicture = uploadResult.Location;
      console.log(profilePicture);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    req.body.password = hashedPassword;
    let otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    var user = new User({ ...req.body, otp, user_type, profilePicture });
    await user.save();
    const userWithoutOtp = user.toObject();
    delete userWithoutOtp.otp;
    delete userWithoutOtp.password;
    let token = await generateToken(userWithoutOtp);
    res.status(200).json({
      status: true,
      message: "User Registered Successfully please verify otp",
      userWithoutOtp,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
export const login_controller = async (req, res) => {
  try {
    console.log(req.body)
    const { error } = login_validation.validate({
      ...req.body,
    });
    if (error) {
      let details = error.details.map((detail) => {
        return {
          field: detail.path.join("."),
          message: detail.message,
        };
      });
      return res.status(400).send({
        message: "Validation Failed",
        details,
      });
    }
    let { password, phoneNumber } = req.body;
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password, async (error, result) => {
        if (error) {
          return res.status(500).json({
            status: false,
            message: "Something wnet wrong in bcrypt",
            error: error,
          });
        }
        if (result) {
          // Password matches
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.SECRETKEY,
            { expiresIn: "21h" }
          );
          return res
            .status(200)
            .cookie(
              'user',
              {
                status: true,
                message: "Login successful",
                token,
                userId:existingUser.id,
                username:existingUser.username,
                user_type: existingUser.user_type,
                isVerified: existingUser.isVerified,
                phoneNumber:existingUser.phoneNumber
  
              },
            )
            .json({
              status: true,
              message: "Login successful",
              token,
              userId:existingUser.id,
              username:existingUser.username,
              user_type: existingUser.user_type,
              isVerified: existingUser.isVerified,
              phoneNumber:existingUser.phoneNumber
            });
        } else {
          // Password doesn't match
          return res
            .status(401)
            .json({ status: false, message: "Incorrect password" });
        }
      });
      // console.log(result);
    } else {
      return res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Internal server error", error });
  }
};
export const Get_dj = async (req, res) => {
  try {
    const Users = await User.find({ user_type: "dj", isVerified: true })
      .select("-password")
      .select("-otp");
    res.status(200).json({"succss":true,'message':'Djs Data','data':Users});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const Request_Song = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const songId=req.params.songId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findOne({
      _id: userId,
      user_type: "dj",
      isVerified: true
    })

    if (!user) {
      return res.status(404).json({ message: "DJ not found" });
    }
    const song=await Song.findOne({_id:songId})
    console.log(song);
    
    // Return the user details
    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const GetuserDetails = async (req, res) => {
  try {

    const userId = req.params.userId;
    console.log("backen py a gaii "+userId);
    const user = await User.findById(userId)
      .select("-password")
      // .select("-otp")
      .select("-OtpSended");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Request_Dj = async (req, res) => {
  try {
    const { userId, songId, deliver_status } = req.body;
    console.log(req.body); // Log to ensure data is received

    if (!userId || !songId) {
      return res.status(400).json({ message: 'UserId and SongId are required' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const customer_user = await User.findById(userId);
    if (!customer_user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { error } = OrderValidationSchema.validate({
      customer_id: userId,
      songId,
      deliver_status,
    });
    if (error) {
      let details = error.details.map((detail) => {
        return {
          field: detail.path.join("."),
          message: detail.message,
        };
      });
      return res.status(400).json({ message: "Validation Failed", details });
    }

    var order = new Order({
      customer_id: customer_user._id,
      songId: song._id,
      deliver_status: deliver_status,
      Songname: song.name,
      customerUsername: customer_user.username,
      duration: song.duration,
      djUsername: song.username,
      djId: song.userId,
    });
    console.log(order)
    await order.save();

    // Update the deliver_status of the song
    song.deliver_status = deliver_status;
    await song.save();

    res.json(order);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { deliver_status } = req.body;
  console.log("mashallah")
  console.log(id)
  console.log(req.body);
  // Validate the deliver_status
  if (!['Approved', 'Rejected'].includes(deliver_status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Update the request status
    const request = await Request.findByIdAndUpdate(
      id,
      { deliver_status },
      { new: true } // Return the updated document
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Respond with the updated request
    res.status(200).json({ message: 'Request updated successfully', request });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getAllreq = async (req, res) => {
  try {
    const Allreq = await Order.find();

    console.log("Allreq on controller", Allreq)
    // const user = await User.findById(userId)
    return res.status(200).json({ status: true, message: "Requests retrieved successfully", data: Allreq });
  } catch (error) {
    console.error("Error retrieving Requests:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};



export const Create_song = async (req, res) => {
  try {
    const userId = req.decoded.userId;
    const savedUser = await User.findById(userId);
    console.log("ye ha")
    console.log(savedUser)
    if (!savedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ status: false, message: "File is required" });
    }

    // Extract necessary data from request
    const { name, price, duration } = req.body; // Assuming these are passed in req.body

    if (!name || !price || !duration) {
      return res.status(400).json({ status: false, message: "Name, price, and duration are required" });
    }

    const fileContent = req.file.buffer;
    const { originalname } = req.file;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: getBytes() + "" + new Date().getTime() + "" + originalname,
      Body: fileContent,
    };

    const uploadResult = await s3.upload(params).promise();
    const songUrl = uploadResult.Location;

    const song = new Song({
      name: name,
      price: price,
      file: songUrl,
      duration: duration,
      userId: savedUser.id,
      username:savedUser.username,
    });

    await song.save();

    return res.status(200).json({ status: true, message: "Song uploaded successfully" });
  } catch (error) {
    console.error("Error creating song:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    return res.status(200).json({ status: true, message: "Songs retrieved successfully", data: songs });
  } catch (error) {
    console.error("Error retrieving songs:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

export const getSongById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid song ID" });
    }

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ status: false, message: "Song not found" });
    }

    return res.status(200).json({ status: true, message: "Song retrieved successfully", data: song });
  } catch (error) {
    console.error("Error retrieving song:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};