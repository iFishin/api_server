"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path_1.default.join(__dirname, "../temps");
        try {
            if (!fs_1.default.existsSync(dirPath)) {
                fs_1.default.mkdirSync(dirPath, { recursive: true });
            }
            cb(null, dirPath);
        }
        catch (err) {
            cb(err, "");
        }
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        cb(null, `${timestamp}-${sanitizedFilename}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain",
        "application/octet-stream",
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("text/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Unsupported file type"));
    }
};
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB
const upload = (0, multer_1.default)({ storage, fileFilter, limits }).single("file");
exports.default = upload;
