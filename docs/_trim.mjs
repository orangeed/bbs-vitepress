/**
 * 一次性脚本：把 NavHub.scss 裁剪为「只消费全局主题 token」的组件样式。
 * 保留 "Base" 段落及之后的内容，前面换成结构 token 声明。
 */
import fs from 'node:fs';

const P = 'd:/my/sugarat/docs/components/NavHub/NavHub.scss';
const src = fs.readFileSync(P, 'utf8');
const lines = src.split(/\r?\n/);

const idx = lines.findIndex((l, i) => /^\s+Base\s*$/.test(l) && /={10,}/.test(lines[i - 1] || ''));
if (idx < 0) throw new Error('未找到 Base 段落标记');

const rest = lines.slice(idx - 1).join('\n');

const header = `/* ============================================================================
   NavHub · 组件样式
   ----------------------------------------------------------------------------
   颜色的唯一真源是全局主题层：theme/styles/themes.scss（主题类挂在 <html> 上）。
   本文件只声明组件级结构 token 与样式，全部引用 --bg-* / --text-* / --line* /
   --accent* 等语义变量，因此切换全站风格时自动跟随，不再自带主题表。
   ============================================================================ */

/* ============================================
   结构 token（与主题无关；颜色见 themes.scss）
   ============================================ */
.navhub-app {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 56px;
  --space-16: 80px;
}

`;

fs.writeFileSync(P, header + rest, 'utf8');
console.log(`✓ NavHub.scss 已裁剪：${lines.length} → ${(header + rest).split('\n').length} 行`);
