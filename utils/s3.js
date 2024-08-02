import AWS from "aws-sdk";

// Create a new instance of the S3 service
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  correctClockSkew: true,
});

export default s3;