import crypto from "crypto";

const getBytes = () => {
  let bytes = crypto.randomBytes(16).toString("hex");
  return bytes;
};

console.log(getBytes());
export default getBytes;
