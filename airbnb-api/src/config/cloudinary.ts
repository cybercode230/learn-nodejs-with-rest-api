import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your account credentials
// This must run before any upload calls
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

// uploadToCloudinary takes a file buffer and uploads it to Cloudinary
// folder: organizes files in your Cloudinary media library
// Returns the upload result which includes secure_url and public_id
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    // upload_stream is used when you have a buffer (not a file path)
    // It opens a writable stream that Cloudinary reads from
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        // resource_type: "auto" detects whether it's an image or video
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Write the buffer into the stream and close it
    stream.end(buffer);
  });
}

// deleteFromCloudinary removes a file from Cloudinary by its public_id
// Call this when a user deletes their profile picture or a listing photo
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;