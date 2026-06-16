import React, { useState } from 'react';
import { FiUpload, FiX, FiImage, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CLOUD_NAME    = 'dutpjvdwq';
const UPLOAD_PRESET = 'skymall_products';

const CloudinaryUpload = ({ onUpload, currentImage, label = 'Upload Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentImage || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file',           file);
      formData.append('upload_preset',  UPLOAD_PRESET);
      formData.append('cloud_name',     CLOUD_NAME);

      const res  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setPreview(data.secure_url);
      onUpload(data.secure_url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => { setPreview(null); onUpload(null); };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700
                          dark:text-gray-300 mb-2">{label}</label>
      )}
      {preview ? (
        <div className="relative w-full aspect-square max-w-[160px] rounded-xl
                        overflow-hidden border-2 border-primary/30 group">
          <img src={preview} alt="Preview"
               className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0
                          group-hover:opacity-100 transition flex items-center
                          justify-center gap-2">
            <button type="button" onClick={handleRemove}
              className="p-1.5 bg-danger text-white rounded-lg">
              <FiX size={14} />
            </button>
          </div>
          <label className="absolute bottom-0 left-0 right-0 bg-black/50
                            text-white text-xs text-center py-1 cursor-pointer
                            hover:bg-black/70 transition">
            <FiUpload size={10} className="inline mr-1" /> Change
            <input type="file" accept="image/*" onChange={handleFileChange}
                   className="hidden" />
          </label>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full
                           aspect-square max-w-[160px] rounded-xl border-2
                           border-dashed cursor-pointer transition
                           ${uploading
                             ? 'border-primary bg-primary/5'
                             : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                           }`}>
          {uploading ? (
            <>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent
                              rounded-full animate-spin mb-2" />
              <p className="text-xs text-primary">Uploading...</p>
            </>
          ) : (
            <>
              <FiImage size={24} className="text-gray-400 mb-2" />
              <p className="text-xs font-medium text-gray-500 text-center px-2">
                Click to upload
              </p>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange}
                 className="hidden" disabled={uploading} />
        </label>
      )}
    </div>
  );
};

// ── Multi-image upload component ─────────────────────────────
export const MultiImageUpload = ({ images = [], onImagesChange, maxImages = 6 }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = maxImages - images.length;
    const toUpload  = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.error(`You can only add ${remaining} more image${remaining !== 1 ? 's' : ''}`);
    }

    setUploading(true);
    const uploaded = [];

    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is too large`); continue; }

      try {
        const formData = new FormData();
        formData.append('file',          file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('cloud_name',    CLOUD_NAME);

        const res  = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploaded.push({ url: data.secure_url, is_primary: false });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploaded.length) {
      const newImages = [...images, ...uploaded];
      // ensure first image is primary if no primary set
      if (!newImages.some((img) => img.is_primary)) {
        newImages[0].is_primary = true;
      }
      onImagesChange(newImages);
      toast.success(`${uploaded.length} image${uploaded.length !== 1 ? 's' : ''} uploaded!`);
    }
    setUploading(false);
  };

  const handleRemove = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    // ensure primary is set
    if (newImages.length && !newImages.some((img) => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    onImagesChange(newImages);
  };

  const handleSetPrimary = (idx) => {
    const newImages = images.map((img, i) => ({ ...img, is_primary: i === idx }));
    onImagesChange(newImages);
    toast.success('Primary image set');
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, idx) => (
          <div key={idx}
            className="relative w-28 h-28 rounded-xl overflow-hidden border-2
                       group flex-shrink-0
                       ${img.is_primary
                         ? 'border-primary shadow-lg shadow-primary/20'
                         : 'border-gray-200 dark:border-gray-700'}">
            <img src={img.url} alt={`Product ${idx + 1}`}
                 className="w-full h-full object-cover" />

            {/* Primary badge */}
            {img.is_primary && (
              <div className="absolute top-1 left-1 bg-primary text-white text-xs
                              px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                <FiStar size={9} /> Main
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0
                            group-hover:opacity-100 transition flex items-center
                            justify-center gap-2">
              {!img.is_primary && (
                <button type="button" onClick={() => handleSetPrimary(idx)}
                  className="p-1.5 bg-primary text-white rounded-lg"
                  title="Set as main image">
                  <FiStar size={13} />
                </button>
              )}
              <button type="button" onClick={() => handleRemove(idx)}
                className="p-1.5 bg-danger text-white rounded-lg"
                title="Remove">
                <FiX size={13} />
              </button>
            </div>
          </div>
        ))}

        {/* Add more */}
        {images.length < maxImages && (
          <label className={`w-28 h-28 rounded-xl border-2 border-dashed
                             cursor-pointer flex flex-col items-center justify-center
                             transition flex-shrink-0
                             ${uploading
                               ? 'border-primary bg-primary/5'
                               : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
                             }`}>
            {uploading ? (
              <>
                <div className="w-7 h-7 border-3 border-primary border-t-transparent
                                rounded-full animate-spin mb-1" />
                <p className="text-xs text-primary">Uploading...</p>
              </>
            ) : (
              <>
                <FiUpload size={22} className="text-gray-400 mb-1.5" />
                <p className="text-xs text-gray-500 text-center px-2">
                  Add photo
                </p>
                <p className="text-xs text-gray-400">
                  {images.length}/{maxImages}
                </p>
              </>
            )}
            <input type="file" accept="image/*" multiple onChange={handleFileChange}
                   className="hidden" disabled={uploading} />
          </label>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          Click ⭐ on an image to set it as the main product photo.
          {images.length < maxImages && ` Add up to ${maxImages - images.length} more.`}
        </p>
      )}
    </div>
  );
};

export default CloudinaryUpload;
