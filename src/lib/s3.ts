import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-west-1",
  // Credentials are automatically loaded from the environment
  // credentials: {
  //   accessKeyId: 'YOUR_ACCESS_KEY_ID',
  //   secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
  // }
});

export function s3File(filePath: string) {
  return `https://markmiro-website-content.s3.us-west-1.amazonaws.com/${filePath}`;
}

export async function listFileNames(path: string) {
  // Call the ListObjectsV2Command to get a list of objects in the bucket
  const data = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: "markmiro-website-content",
      Prefix: path,
    })
  );

  return data.Contents?.map((obj) => obj.Key || "") || [];
}
