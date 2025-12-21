import axios from 'axios';

export const uploadImagesToCloudinary = async (files) => {
  const uploadPresets = "mercedes_shop"; 
  const cloudName = "djod9on8s";
  const urls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPresets);

    try {
      // Sử dụng fetch thuần để tránh bị dính header Authorization từ axios config
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          // Không thêm bất kỳ header nào vào đây
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }

      const data = await response.json();
      urls.push(data.secure_url);
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error.message);
    }
  }
  return urls;
};