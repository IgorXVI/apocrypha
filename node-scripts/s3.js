import dotenv from "dotenv"
dotenv.config()

import { S3Client } from "@aws-sdk/client-s3"

export const createS3Client = () =>
    new S3Client({
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACESS_KEY_ID ?? "",
            secretAccessKey: process.env.AWS_SECRET_ACCES_KEY ?? "",
        },
    })

export const s3Bucket = process.env.S3_IMG_BUCKET ?? ""
