import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(__dirname, "../temps");
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      cb(null, dirPath);
    } catch (err) {
      cb(err as Error, "");
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${timestamp}-${sanitizedFilename}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/octet-stream",
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("text/")) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

const upload = multer({ storage, fileFilter, limits }).single("file");

export default upload;