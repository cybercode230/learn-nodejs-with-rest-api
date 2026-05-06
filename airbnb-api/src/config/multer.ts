import multer from "multer";

/**
 * Multer configuration for file uploads.
 * Supports images, videos, and documents up to 50MB.
 * Stores files in memory to stream them directly to Cloudinary.
 */

// memoryStorage keeps the file in memory as req.file.buffer
// This is what we need to stream the file directly to Cloudinary
// DiskStorage would save to disk first — unnecessary extra step
const storage = multer.memoryStorage();

// File filter — allow images, videos, and documents
// This runs before the file is stored, rejecting unallowed uploads early
function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowedTypes = [
    // Images
    "image/jpeg", "image/png", "image/webp", "image/gif",
    // Videos
    "video/mp4", "video/mpeg", "video/quicktime", "video/webm",
    // Documents
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error("Only images, videos, and documents are allowed"));
  }
}

const upload = multer({
  storage,
  fileFilter,

  // Limit file size to 50MB
  // Without this, users could upload huge files and crash your server
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;