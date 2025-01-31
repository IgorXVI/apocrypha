import dotenv from "dotenv"
dotenv.config()

import { S3Client } from "@aws-sdk/client-s3"

const accessKeyId = process.env.AWS_ACESS_KEY_ID ?? ""
const secretAccessKey = process.env.AWS_SECRET_ACCES_KEY ?? ""

export const createS3Client = () =>
    new S3Client({
        region: "us-east-1",
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    })

export const s3Bucket = process.env.S3_IMG_BUCKET ?? ""
export const s3CloudfrontUrl = process.env.S3_CLOUDFRONT_URL ?? ""
