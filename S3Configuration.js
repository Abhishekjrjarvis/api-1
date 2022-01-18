require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.BUCKET_ACCESS_KEY;
const secrectAccessKey = process.env.BUCKET_ACCESS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secrectAccessKey,
});

//upload afile to s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;
//download a file from s3
