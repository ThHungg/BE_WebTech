const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (folder = "") => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = folder ? `public/Img/${folder}` : "public/Img";

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
};

const createUpload = (folder) => {
  const storage = createStorage(folder);
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận các định dạng ảnh: jpeg, jpg, png"));
      }
    },
  });
};

module.exports = {
  uploadBrand: createUpload("brands"),
};
