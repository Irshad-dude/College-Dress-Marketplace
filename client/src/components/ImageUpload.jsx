import { useCallback, useState } from 'react';
import { MdCloudUpload, MdClose } from 'react-icons/md';

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;

export default function ImageUpload({ onImagesChange, existingImages = [] }) {
  const [previews, setPreviews] = useState(
    existingImages.map((url) => ({ url, file: null }))
  );
  const [dragging, setDragging] = useState(false);
  const processFiles = useCallback(
    (files) => {
      const validFiles = Array.from(files).filter((f) => {
        if (!f.type.startsWith('image/')) return false;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
        return true;
      });
      const remaining = MAX_FILES - previews.length;
      const toAdd = validFiles.slice(0, remaining);
      const newPreviews = toAdd.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      const updated = [...previews, ...newPreviews];
      setPreviews(updated);
      onImagesChange(updated.map((p) => p.file).filter(Boolean));
    },
    [previews, onImagesChange]
  );
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const handleChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };
  const removeImage = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onImagesChange(updated.map((p) => p.file).filter(Boolean));
  };
  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      {previews.length < MAX_FILES && (
        <label
          className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            dragging
              ? 'border-amber-700 bg-amber-100'
              : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-100'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <MdCloudUpload className="text-4xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            <span className="text-amber-800 font-semibold">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, WEBP up to {MAX_SIZE_MB}MB ({previews.length}/{MAX_FILES})
          </p>
          <input type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />
        </label>
      )}
      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
              >
                <MdClose className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
