import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "../../public/uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Allow only images
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

export const upload = multer({
  storage,
  limits: {
    files: 3,
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
  fileFilter,
});
