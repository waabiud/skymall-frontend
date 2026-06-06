import React, { useState } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CLOUD_NAME    = 'dutpjvdwq';
const UPLOAD_PRESET = 'skymall_products';

const CloudinaryUpload = ({ onUpload, currentImage, label = 'Upload Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentImage || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file',          file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name',    CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setPreview(data.secure_url);
      onUpload(data.secure_url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload(null);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700
                          dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative w-full aspect-square max-w-xs rounded-2xl
                        overflow-hidden border-2 border-primary/30 group">
          <img src={preview} alt="Preview"
               className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0
                          group-hover:opacity-100 transition flex items-center
                          justify-center">
            <button type="button" onClick={handleRemove}
              className="p-2 bg-danger text-white rounded-full
                         hover:bg-red-700 transition">
              <FiX size={18} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <label className="flex items-center justify-center gap-2 px-3 py-1.5
                              bg-white/90 rounded-lg text-xs font-medium
                              text-gray-700 cursor-pointer hover:bg-white transition">
              <FiUpload size={12} /> Change Image
              <input type="file" accept="image/*" onChange={handleFileChange}
                     className="hidden" />
            </label>
          </div>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full
                           aspect-square max-w-xs rounded-2xl border-2 border-dashed
                           cursor-pointer transition
                           ${uploading
                             ? 'border-primary bg-primary/5'
                             : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                           }`}>
          {uploading ? (
            <>
              <div className="w-10 h-10 border-4 border-primary border-t-transparent
                              rounded-full animate-spin mb-3" />
              <p className="text-sm text-primary font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <FiImage size={32} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to upload image
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange}
                 className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  );
};

export default CloudinaryUpload;
