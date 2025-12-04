const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists (prevents ENOENT errors when saving files)
const uploadDir = path.join(__dirname, "..", "uploads");
try {
    fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
    // If directory creation fails, let multer throw at runtime; log for debugging
    console.error("Failed to ensure upload directory exists:", err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

function fileFilter(req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"), false);
}

module.exports = multer({ storage, fileFilter });
