/**
 * 复制工具：富文本 / 纯文本。全部依赖 DOM，只能在客户端事件回调里调用。
 * toast 回调由调用方传入（来自 toast.js），保持本模块无状态。
 */

/** 富文本复制：优先用现代 Clipboard API 直接写 text/html，避免 contenteditable +
    execCommand('copy') 把内嵌 <a> 链接的 selection 提权到整个内容块
    （公众号会把所有文字按"链接色+高亮"渲染） */
export function copyRich(html, toast) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const textBlob = new Blob([stripTags(html)], { type: 'text/plain;charset=utf-8' });
      navigator.clipboard.write([new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })]);
      return;
    }
  } catch (e) {
    /* 降级到 execCommand */
  }
  fallbackCopyRich(html, toast);
}

function fallbackCopyRich(html, toast) {
  const holder = document.createElement('div');
  holder.contentEditable = 'true';
  holder.innerHTML = html;
  holder.style.cssText = 'position:fixed;left:-9999px;top:0;width:420px;opacity:0';
  document.body.appendChild(holder);

  // 临时移除所有 <a> 的 href，避免 Chromium execCommand('copy') 跨链接 selection 时
  // 把整个选区都按"链接色+高亮"渲染（selection 提权）
  const links = holder.querySelectorAll('a[href]');
  const saved = [];
  links.forEach((a) => {
    saved.push([a, a.getAttribute('href')]);
    a.removeAttribute('href');
  });

  const range = document.createRange();
  range.selectNodeContents(holder);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    /* 部分浏览器禁用 execCommand */
  }
  sel.removeAllRanges();

  saved.forEach(([a, href]) => a.setAttribute('href', href));
  document.body.removeChild(holder);
  if (!ok) fallbackCopy(html, '', toast);
}

function stripTags(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.innerText || d.textContent || '';
}

/** 纯文本兜底复制：隐藏 textarea + execCommand */
export function fallbackCopy(text_, msg, toast) {
  const ta = document.createElement('textarea');
  ta.value = text_;
  ta.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch (e) {
    /* 忽略 */
  }
  document.body.removeChild(ta);
  if (msg && toast) toast(msg);
}
