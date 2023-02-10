// Resources:
// - https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
// - ChatGPT
//  - "script to upload files to s3 bucket"
//  - "how about with AWS SDK for JavaScript"
//  - "s3 public access bucket policy code"
//  - https://chat.openai.com/chat/c3576cb8-4a25-4b04-98dc-ca4c4913e9dc
const S3 = require("aws-sdk/clients/s3.js");
const BUCKET_NAME = "markmiro-website-content";

// console.log("process.env.S3_ID", process.env.S3_ID);

const s3 = new S3({
  accessKeyId: process.env.S3_ID,
  secretAccessKey: process.env.S3_SECRET,
});

const uploadToS3 = (localFile, s3File) => {
  const fileContent = require("fs").readFileSync(localFile);

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3File,
    Body: fileContent,
  };

  console.log("Uploading to S3...");
  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`File uploaded successfully at ${data.Location}`);
  });
};

uploadToS3("local_file.txt", "s3_file.txt");
