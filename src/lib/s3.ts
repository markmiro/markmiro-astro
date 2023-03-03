export function s3File(filePath: string) {
  return `https://markmiro-website-content.s3.us-west-1.amazonaws.com/${filePath}`;
}
export function localToS3(filePath: string) {
  const [, second] = filePath.split("public/s3/");
  return s3File(second);
}
