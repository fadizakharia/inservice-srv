import aws from "aws-sdk";
import { config } from "dotenv";
config({
  path: `env/${process.env.NODE_ENV}.env`,
});
export const S3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
