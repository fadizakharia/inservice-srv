import sdk from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "../constants/S3Config";
import { v4 } from "uuid";
export const singleFileUpload = () => {
  return multer({
    storage: multerS3({
      bucket: "inservice-fp",
      s3: S3 as any,
      acl: "public-read",
      metadata: function (_, file: any, cb) {
        console.log(file);

        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cd) {
        console.log(file);

        cd(null, Date.now().toString());
      },
    }),
  });
};
