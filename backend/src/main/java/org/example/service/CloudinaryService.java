package org.example.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.example.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    private static final List<String> ALLOWED_FORMATS = List.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload a single file to Cloudinary
     * @param file MultipartFile to upload
     * @param folder Folder name in Cloudinary (e.g., "cars", "categories")
     * @return URL of uploaded image
     */
    public String uploadFile(MultipartFile file, String folder) {
        validateFile(file);
        
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", "mercedes_shop/" + folder,
                "public_id", UUID.randomUUID().toString(),
                "overwrite", true,
                "resource_type", "image"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new BadRequestException("Không thể upload ảnh: " + e.getMessage());
        }
    }

    /**
     * Upload multiple files to Cloudinary
     * @param files List of MultipartFiles to upload
     * @param folder Folder name in Cloudinary
     * @return List of URLs of uploaded images
     */
    public List<String> uploadFiles(List<MultipartFile> files, String folder) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(uploadFile(file, folder));
        }
        return urls;
    }

    /**
     * Upload image from URL to Cloudinary
     * @param imageUrl URL of the image to upload
     * @param folder Folder name in Cloudinary
     * @return URL of uploaded image on Cloudinary
     */
    public String uploadFromUrl(String imageUrl, String folder) {
        validateUrl(imageUrl);
        
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                "folder", "mercedes_shop/" + folder,
                "public_id", UUID.randomUUID().toString(),
                "overwrite", true,
                "resource_type", "image"
            );

            Map<?, ?> result = cloudinary.uploader().upload(imageUrl, options);
            return (String) result.get("secure_url");
        } catch (Exception e) {
            throw new BadRequestException("Không thể upload ảnh từ URL: " + e.getMessage());
        }
    }

    /**
     * Upload multiple images from URLs to Cloudinary
     * @param imageUrls List of image URLs to upload
     * @param folder Folder name in Cloudinary
     * @return List of URLs of uploaded images on Cloudinary
     */
    public List<String> uploadFromUrls(List<String> imageUrls, String folder) {
        List<String> urls = new ArrayList<>();
        for (String imageUrl : imageUrls) {
            urls.add(uploadFromUrl(imageUrl, folder));
        }
        return urls;
    }

    /**
     * Delete image from Cloudinary by URL
     * @param imageUrl URL of the image to delete
     */
    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log error but don't throw - deletion failure shouldn't break the flow
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Delete multiple images from Cloudinary
     * @param imageUrls List of image URLs to delete
     */
    public void deleteImages(List<String> imageUrls) {
        for (String url : imageUrls) {
            deleteImage(url);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File quá lớn. Kích thước tối đa là 10MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BadRequestException("Tên file không hợp lệ");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_FORMATS.contains(extension)) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: " + String.join(", ", ALLOWED_FORMATS));
        }
    }

    private void validateUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            throw new BadRequestException("URL ảnh không được để trống");
        }

        try {
            new URL(imageUrl);
        } catch (Exception e) {
            throw new BadRequestException("URL ảnh không hợp lệ");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private String extractPublicId(String imageUrl) {
        try {
            // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
            if (imageUrl.contains("cloudinary.com")) {
                String[] parts = imageUrl.split("/upload/");
                if (parts.length > 1) {
                    String path = parts[1];
                    // Remove version if present (v1234567890/)
                    if (path.startsWith("v")) {
                        int slashIndex = path.indexOf('/');
                        if (slashIndex != -1) {
                            path = path.substring(slashIndex + 1);
                        }
                    }
                    // Remove file extension
                    int lastDotIndex = path.lastIndexOf('.');
                    if (lastDotIndex != -1) {
                        path = path.substring(0, lastDotIndex);
                    }
                    return path;
                }
            }
        } catch (Exception e) {
            // Ignore extraction errors
        }
        return null;
    }
}
