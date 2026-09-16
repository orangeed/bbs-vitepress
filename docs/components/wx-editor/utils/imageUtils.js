/**
 * 图片处理工具（纯函数，依赖浏览器 API，须在客户端调用）。
 */

/** 文件 -> dataURL：压缩到 MAX_IMG_W 以内，过大时转 JPEG 二次压缩 */
export function fileToDataUrl(file, maxW = 1080) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const g = c.getContext('2d');
        g.fillStyle = '#FFFFFF';
        g.fillRect(0, 0, w, h);
        g.drawImage(img, 0, 0, w, h);
        let out = c.toDataURL('image/png');
        if (out.length > 900 * 1024) out = c.toDataURL('image/jpeg', 0.85);
        resolve(out);
      };
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/** dataURL -> Blob（按二进制上传，避免 base64 再膨胀 1/3） */
export function dataUrlToBlob(dataUrl) {
  const s = String(dataUrl);
  const comma = s.indexOf(',');
  if (comma < 0) throw new Error('图片数据格式不正确');
  const head = s.slice(5, comma); // 形如 image/png;base64
  const mime = head.split(';')[0] || 'image/png';
  const bin = atob(s.slice(comma + 1));
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}
