import multer from "multer";

// Memory storage keeps file buffer in memory so we can upload to Cloudinary stream
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});
