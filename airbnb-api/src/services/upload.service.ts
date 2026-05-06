import { uploadToCloudinary } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

/**
 * UploadService handles all business logic related to file uploads.
 * It interacts with the Cloudinary configuration and the Prisma database
 * to process and record uploaded media such as avatars, profile attachments, and listing photos.
 */
export class UploadService {
  /**
   * Uploads an avatar image and updates the user's database record.
   *
   * @param userId - The ID of the user.
   * @param fileBuffer - The buffer of the uploaded file.
   * @returns The updated user record.
   */
  static async uploadAvatar(userId: string, fileBuffer: Buffer) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Upload to Cloudinary in the avatars folder
    const { url } = await uploadToCloudinary(fileBuffer, "airbnb/avatars");

    // Update the user's avatar URL in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
    });

    return updatedUser;
  }

  /**
   * Uploads a generic file (image, video, document) to Cloudinary.
   * This is useful for listings, profile attachments, etc.
   *
   * @param fileBuffer - The buffer of the uploaded file.
   * @param folder - The Cloudinary folder to place the file in.
   * @returns The secure URL and public ID of the uploaded file.
   */
  static async uploadGenericFile(fileBuffer: Buffer, folder: string = "airbnb/general") {
    return await uploadToCloudinary(fileBuffer, folder);
  }

  /**
   * Retrieves all uploaded files from Cloudinary within a specific prefix.
   * @param prefix The prefix/folder to search in (e.g. "airbnb")
   */
  static async getAllUploadedFiles(prefix: string = "airbnb") {
    // Uses the Cloudinary Search API which is more robust
    const result = await cloudinary.search
      .expression(`folder:${prefix}/*`)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();
      
    return result.resources.map((res: any) => ({
      url: res.secure_url,
      publicId: res.public_id,
      format: res.format,
      resourceType: res.resource_type,
      createdAt: res.created_at,
    }));
  }
}
