import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary SDK if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a Multer file buffer or base64 file string to Cloudinary.
 * @param {Buffer|String} fileSource Multer file buffer or Base64 string
 * @param {String} mediaType 'image' | 'video' | 'audio' | 'document' | 'gif'
 * @param {String} originalName Original filename
 */
export const uploadToCloudinary = async (fileSource, mediaType = "image", originalName = "file") => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.warn("CLOUDINARY_CLOUD_NAME is not set. Returning data URI fallback.");
    if (Buffer.isBuffer(fileSource)) {
      const mimeType = mediaType === "image" ? "image/jpeg" : "application/octet-stream";
      return {
        url: `data:${mimeType};base64,${fileSource.toString("base64")}`,
        mediaType,
        fileName: originalName,
        publicId: null,
      };
    }
    return {
      url: fileSource,
      mediaType,
      fileName: originalName,
      publicId: null,
    };
  }

  try {
    let resourceType = "auto";
    if (mediaType === "document") {
      resourceType = "raw";
    } else if (mediaType === "video" || mediaType === "audio") {
      resourceType = "video";
    } else if (mediaType === "image" || mediaType === "gif") {
      resourceType = "image";
    }

    if (Buffer.isBuffer(fileSource)) {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: "connexa_chats",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary stream error:", error);
              return resolve({
                url: `data:application/octet-stream;base64,${fileSource.toString("base64")}`,
                mediaType,
                fileName: originalName,
                publicId: null,
              });
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              mediaType,
              fileName: originalName || result.original_filename,
            });
          }
        );
        uploadStream.end(fileSource);
      });
    } else {
      // Base64 upload
      const result = await cloudinary.uploader.upload(fileSource, {
        resource_type: resourceType,
        folder: "connexa_chats",
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        mediaType,
        fileName: originalName || result.original_filename,
      };
    }
  } catch (err) {
    console.error("Cloudinary upload exception:", err);
    return {
      url: typeof fileSource === "string" ? fileSource : "",
      mediaType,
      fileName: originalName,
      publicId: null,
    };
  }
};

/**
 * Deletes an asset from Cloudinary using publicId or mediaUrl.
 * @param {String} publicIdOrUrl Cloudinary public_id or full secure URL
 * @param {String} mediaType 'image' | 'video' | 'audio' | 'document' | 'gif'
 */
export const deleteFromCloudinary = async (publicIdOrUrl, mediaType = "image") => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !publicIdOrUrl) return;

  try {
    let publicId = publicIdOrUrl;

    if (publicIdOrUrl.startsWith("http")) {
      const parts = publicIdOrUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1) {
        const pathAfterUpload = parts.slice(uploadIndex + 1);
        if (pathAfterUpload[0] && pathAfterUpload[0].startsWith("v")) {
          pathAfterUpload.shift();
        }
        const fullPath = pathAfterUpload.join("/");
        publicId = fullPath.substring(0, fullPath.lastIndexOf(".")) || fullPath;
      }
    }

    let resourceType = "image";
    if (mediaType === "video" || mediaType === "audio") {
      resourceType = "video";
    } else if (mediaType === "document") {
      resourceType = "raw";
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`Cloudinary asset '${publicId}' deleted successfully:`, result);
    return result;
  } catch (err) {
    console.error("Failed to delete asset from Cloudinary:", err);
  }
};
