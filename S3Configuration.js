require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const sharp = require("sharp");
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const sharpify = async (file, width, height) => {
  try {
    const image = sharp(file.path);
    const meta = await image.metadata();
    const { format } = meta;

    const config = {
      jpeg: { quality: 100 },
      jpg: { quality: 100 },
      webp: { quality: 100 },
      png: { quality: 100 },
      svg: { quality: 100 },
    };

    const newFile = await image[format](config[format])
      .resize({
        width: width,
        height: height,
      })
      .toFormat("jpeg", { mozjpeg: true });
    return newFile;
  } catch (err) {
    throw new Error(err);
  }
};
//upload afile to s3
async function uploadFile(file, width, height) {
  // const fileStream = fs.createReadStream(file.path);
  const newFile = await sharpify(file, width, height);
  const uploadParams = {
    Bucket: bucketName,
    Body: newFile,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

//upload afile to s3
async function uploadVideo(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadVideo = uploadVideo;
//upload afile of docs to s3
function uploadDocFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(uploadParams).promise();
}
exports.uploadDocFile = uploadDocFile;

//download a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };
  return s3.getObject(downloadParams).createReadStream();
}

exports.getFileStream = getFileStream;

//for delete a file from s3
function deleteFile(fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };
  return s3.deleteObject(params).promise();
}
exports.deleteFile = deleteFile;
