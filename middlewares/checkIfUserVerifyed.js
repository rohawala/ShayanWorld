import { User, userVerificationValidation } from "../modal/User.js";

const checkIfUserVerified = async (req, res, next) => {
  try {
    console.log(req.body)
    const { error } = userVerificationValidation.validate(req.body);
    console.log("api ny bhja middlewhere ma");
    if (error) {
    console.log("validation ma  error aa gya ")
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
    const {phoneNumber,otp}=req.body

    console.log("validation ma  error ni aya ")
    let user = await User.findOne({phoneNumber});
    if(user){
       console.log("phone sy user dhoond lia")
       const receivedOtp = Array.isArray(otp) ? otp.join('') : String(otp);
       const userOtp = String(user.otp);

       console.log(receivedOtp)
       console.log(userOtp)
       if (receivedOtp.trim() === userOtp.trim()) {
            req.userId=user.id
           next()
        }else{
            res.status(403).json({
                status:false,
                message:"Wrong Otp"
            })
        }

    }else{
        return res
        .status(404)
        .send({ status: false, message: "User Not Found" });
    }

    // if (user && !user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "User is not verified",
    //   });
    // } else if (!user) {
    //   return res
    //     .status(404)
    //     .send({ success: false, message: "User Not Found" });
    // }
    // If the user is verified, call next() to proceed to the next middleware
    // next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default checkIfUserVerified;