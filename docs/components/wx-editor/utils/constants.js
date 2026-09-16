/**
 * 「听风入画」编辑器常量：localStorage 键、图床配置、高亮资源清单。
 * 与组件同目录，被 WxEditor.vue 及各子模块共用。
 */

/* localStorage 键 */
export const LS_DRAFT = 'tingfeng_md_draft';
export const LS_CONF = 'tingfeng_md_conf';
export const LS_TOKEN = 'tingfeng_token';
export const LS_USER = 'tingfeng_user';
/** 历史遗留：早期「图片直传 ImgBB」时期存在本机的 API Key，启动时清理掉，不再使用 */
export const LS_IMGBB = 'tingfeng_imgbb_key';

/* 图床：图片经自建后端上传到对象存储（缤纷云 S4），按登录账号归档 */
/** 图片外链前缀，仅用于界面文案展示（真实地址由后端返回，换 CDN 域名不用改这里） */
export const IMG_HOST = 'https://img.orangecj.cn';
/** 上传前自动压缩到的最大宽度 */
export const MAX_IMG_W = 1080;
/** 「我的图片」依赖自建后端（按登录账号分组），入口常开 */
export const BACKEND_GALLERY = true;

/* 撤销 / 重做 */
export const UNDO_MAX = 50;
export const UNDO_DEBOUNCE = 500;

/* 图片语法匹配（扫描正文图片用） */
export const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/* 预览区空态文案 */
export const PREVIEW_EMPTY =
  '<p style="color:#C4C4C4;font-size:13px;text-align:center;padding:60px 0">左侧开始写，这里实时预览</p>';

/* highlight.js 资源（与组件同目录的 ./lib，整站部署 / 打包 App 均离线可用）
   浏览器版 highlight.js 是 UMD 脚本、不能按 ESM 打包，所以交给 Vite 当静态资源处理：
   ?url 会带上 base 前缀和内容 hash，换域名或部署到子路径都不用改代码。
   注意：本文件位于 utils/ 子目录，glob 的 key 也是 ../lib 前缀，
   HLJS_CORE / HLJS_LANGS 必须与之保持一致（它们是 LIB_URLS 的查找键）。 */
export const LIB_URLS = import.meta.glob('../lib/*.js', { query: '?url', import: 'default', eager: true });
export const HLJS_CORE = '../lib/highlight.min.js';
export const HLJS_LANGS = [
  '../lib/lang-javascript.min.js', '../lib/lang-typescript.min.js', '../lib/lang-python.min.js', '../lib/lang-bash.min.js',
  '../lib/lang-shell.min.js', '../lib/lang-sql.min.js', '../lib/lang-json.min.js', '../lib/lang-yaml.min.js', '../lib/lang-xml.min.js',
  '../lib/lang-css.min.js', '../lib/lang-c.min.js', '../lib/lang-cpp.min.js', '../lib/lang-csharp.min.js', '../lib/lang-objectivec.min.js',
  '../lib/lang-java.min.js', '../lib/lang-go.min.js', '../lib/lang-php.min.js',
];
