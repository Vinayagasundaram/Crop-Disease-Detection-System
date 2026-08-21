export const createThumbnail = (imagePreview) => {
  return new Promise((resolve) => {
    if (!imagePreview) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 120;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(thumbnailBase64);
    };
  });
};

export const getConfidenceColor = (conf) => {
  const hue = Math.min(140, Math.max(0, (conf / 100) * 140));
  return `hsl(${hue}, 85%, 45%)`;
};

export const formatDate = (dateObj) => {
  return dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
