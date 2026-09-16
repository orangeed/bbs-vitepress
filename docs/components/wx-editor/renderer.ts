/**
 * 「听风入画」Markdown -> 公众号 HTML 渲染引擎（纯函数，无 Vue 依赖）
 *
 * 由 public/wx-editor/wxEditor.html 抽取而来，供 WxEditor.vue 复用。
 * 说明：
 *  - 公众号只支持内联样式，因此所有样式都写进 style 属性；
 *  - CUR / S() 为当前主题的模块级状态，buildHtml() 内部会先设置再同步渲染；
 *  - highlight.js 由组件在客户端动态加载，未加载时自动回退到内置高亮。
 */

/* =========================================================
   1. 主题配色
   ========================================================= */
const THEMES = {
  moqing: {
    name:'墨青 · 淡金（默认）',
    primary:'#1F3D3A', accent:'#B08D57', accentSoft:'#F3EDE2',
    soft:'#F7F5F0', ink:'#3A3A3A', muted:'#8C8C8C', line:'#EAE5DB',
    codeBg:'#1F3D3A', codeFg:'#E7E1D5', codeBar:'#17302E', primaryLight:'#2A4E4A',
    inlineBg:'#F5F1E9', inlineFg:'#9A7135'
  },
  sumo: {
    name:'素墨 · 极简黑白',
    primary:'#242424', accent:'#8A8A8A', accentSoft:'#F2F2F2',
    soft:'#F7F7F7', ink:'#333333', muted:'#909090', line:'#E6E6E6',
    codeBg:'#242424', codeFg:'#ECECEC', codeBar:'#171717', primaryLight:'#343434',
    inlineBg:'#F2F2F2', inlineFg:'#5A5A5A'
  },
  dian: {
    name:'靛蓝 · 暖橙',
    primary:'#2B4570', accent:'#C0803F', accentSoft:'#F6EFE5',
    soft:'#F5F6FA', ink:'#37393D', muted:'#8E9199', line:'#E5E7EE',
    codeBg:'#22375B', codeFg:'#E6EAF2', codeBar:'#1A2B49', primaryLight:'#3A5C93',
    inlineBg:'#F1F3F9', inlineFg:'#2B4570'
  },
  song: {
    name:'松绿 · 朱砂',
    primary:'#2F4F3E', accent:'#A8503A', accentSoft:'#F7EDE8',
    soft:'#F4F7F3', ink:'#343A34', muted:'#8A9188', line:'#E3E8E1',
    codeBg:'#2F4F3E', codeFg:'#E6EDE4', codeBar:'#24402F', primaryLight:'#3C624C',
    inlineBg:'#F1F5EF', inlineFg:'#8A4230'
  },
  cheng: {
    name:'赤橙 · 暖阳',
    primary:'#A85418', accent:'#E08A2E', accentSoft:'#FDF1E0',
    soft:'#FCF8F2', ink:'#3A3733', muted:'#948C82', line:'#EFE6DA',
    codeBg:'#A85418', codeFg:'#FBEFE0', codeBar:'#8A4412', primaryLight:'#C0682A',
    inlineBg:'#FBF1E4', inlineFg:'#B4530A'
  },
  lv: {
    name:'青绿 · 山岚',
    primary:'#1F6B4A', accent:'#3E9B72', accentSoft:'#E8F4EE',
    soft:'#F4FAF6', ink:'#333A36', muted:'#8A948E', line:'#DFEBE4',
    codeBg:'#1F6B4A', codeFg:'#E4F2EB', codeBar:'#17543A', primaryLight:'#2A815A',
    inlineBg:'#EAF5EF', inlineFg:'#1F6B4A'
  },
  lan: {
    name:'湖蓝 · 晴空',
    primary:'#1B4F87', accent:'#2E86C1', accentSoft:'#E6F0F9',
    soft:'#F3F8FC', ink:'#333A42', muted:'#88919B', line:'#DCE8F2',
    codeBg:'#1B4F87', codeFg:'#E4EEF8', codeBar:'#143D6A', primaryLight:'#26639F',
    inlineBg:'#E9F1F9', inlineFg:'#1B4F87'
  }
};

/* ---------- 语法高亮（零依赖手写词法分析，配色对齐 GitHub） ---------- */
const HL_LIGHT = {kw:'#CF222E', str:'#0A3069', num:'#0550AE', com:'#6E7781', fn:'#8250DF', tag:'#116329', attr:'#0550AE', var:'#953800'};
const HL_DARK  = {kw:'#FF7B72', str:'#A5D6FF', num:'#79C0FF', com:'#8B949E', fn:'#D2A8FF', tag:'#7EE787', attr:'#79C0FF', var:'#FFA657'};

const KWS = {
  js:'const let var function return if else for while do break continue new class extends super this typeof instanceof import export from default async await try catch finally throw switch case yield delete void in of static get set with debugger true false null undefined NaN Infinity',
  ts:'const let var function return if else for while do break continue new class extends super this typeof instanceof import export from default async await try catch finally throw switch case yield delete void in of static get set as interface type enum implements readonly public private protected declare namespace abstract keyof is unknown never satisfies infer override true false null undefined',
  html:'', css:'', json:'', yaml:'', md:'', plain:'',
  bash:'if then else elif fi for while do done case esac function return in export local source alias unset eval exec sudo apt yum dnf brew npm npx yarn pnpm git curl wget chmod chown mkdir rmdir rm cp mv ls cat grep sed awk find tar zip unzip ssh scp docker systemctl echo cd test true false',
  py:'def class return if elif else for while break continue pass import from as with try except finally raise lambda yield global nonlocal assert del not and or in is None True False self async await print len range',
  java:'public private protected class interface extends implements static final void int long double float boolean char byte short new return if else for while do break continue switch case default try catch finally throw throws import package this super abstract native synchronized volatile transient instanceof enum assert record var',
  go:'package import func var const type struct interface map chan go defer select case default if else for range break continue return switch fallthrough nil true false string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64 bool byte rune error make new len cap append copy delete panic recover',
  c:'if else for while do break continue return switch case default sizeof typedef struct union enum static const volatile extern register auto void int char float double long short signed unsigned goto include define ifdef ifndef endif NULL true false delete class public private protected template namespace using try catch throw this virtual inline bool',
  sql:'select from where insert into values update set delete create table drop alter add column primary key foreign references join left right inner outer on group by order having limit offset as distinct count sum avg max min case when then else end union all and or not null is in like between',
  php:'echo print if else elseif for while do foreach function class new return public private protected static const var as use namespace try catch finally throw switch case default break continue array isset unset null true false require include extends implements interface abstract final'
};

function langKey(lang){
  const l = String(lang || '').toLowerCase();
  if(/^(js|jsx|javascript|mjs|cjs|node)$/.test(l)) return 'js';
  if(/^(ts|tsx|typescript)$/.test(l)) return 'ts';
  if(/^(vue|html|xml|svg|markup|htm|svelte)$/.test(l)) return 'html';
  if(/^(css|scss|less|sass|stylus)$/.test(l)) return 'css';
  if(/^(json|json5|jsonc)$/.test(l)) return 'json';
  if(/^(sh|bash|shell|zsh|console|terminal|cmd|powershell|ps1)$/.test(l)) return 'bash';
  if(/^(py|python)$/.test(l)) return 'py';
  if(/^(java|kotlin|kt)$/.test(l)) return 'java';
  if(/^(go|golang)$/.test(l)) return 'go';
  if(/^(c|cpp|c\+\+|cc|cxx|h|hpp|objective-c|objc|csharp|c#)$/.test(l)) return 'c';
  if(/^(sql|mysql|pgsql|sqlite)$/.test(l)) return 'sql';
  if(/^php$/.test(l)) return 'php';
  if(/^(yml|yaml)$/.test(l)) return 'yaml';
  if(/^(md|markdown)$/.test(l)) return 'md';
  return 'plain';
}

function highlight(code, lang, hl){
  const L = langKey(lang);
  const kwSet = new Set((KWS[L] || '').split(/\s+/).filter(Boolean));
  const ci = (L === 'sql');                       // SQL 关键字大小写不敏感
  const isHtml = L === 'html', isCss = L === 'css';
  const isJson = L === 'json', isYaml = L === 'yaml';

  const lineC = ['//'];
  if(L === 'py' || L === 'bash' || L === 'yaml' || L === 'php') lineC.push('#');
  if(L === 'sql') lineC.push('--');
  const blockC = [['/*', '*/']];
  if(isHtml) blockC.push(['<!--', '-->']);

  const idChars = isHtml ? /[\w\-:.#]/ : (isCss ? /[\w\-]/ : /[\w$]/);
  const out = [];
  const push = s => out.push(esc(s));
  const colored = (s, c) => out.push(`<span style="color:${c}">${esc(s)}</span>`);

  const n = code.length;
  let i = 0;
  while(i < n){
    const ch = code[i];
    let hit = false;

    for(const [bs, be] of blockC){                                  // 块注释
      if(code.startsWith(bs, i)){
        let end = code.indexOf(be, i + bs.length);
        end = end === -1 ? n : end + be.length;
        colored(code.slice(i, end), hl.com); i = end; hit = true; break;
      }
    }
    if(hit) continue;

    let lc = null;                                                  // 行注释
    for(const s of lineC) if(code.startsWith(s, i)){ lc = s; break; }
    if(lc){
      let end = code.indexOf('\n', i); if(end === -1) end = n;
      colored(code.slice(i, end), hl.com); i = end; continue;
    }

    if(ch === '"' || ch === "'" || ch === '`'){                     // 字符串
      let j = i + 1;
      while(j < n){
        if(code[j] === '\\'){ j += 2; continue; }
        if(code[j] === ch){ j++; break; }
        if(ch !== '`' && code[j] === '\n') break;
        j++;
      }
      const raw = code.slice(i, j);
      if((isJson || isYaml) && /^\s*:/.test(code.slice(j))) colored(raw, hl.attr);
      else colored(raw, hl.str);
      i = j; continue;
    }

    if(/[0-9]/.test(ch) && !/[\w$.]/.test(i ? code[i - 1] : '')){   // 数字
      let j = i;
      while(j < n && /[0-9a-fA-FxX._]/.test(code[j])) j++;
      if(/[eE]/.test(code[j] || '') && /[+-]/.test(code[j + 1] || '')) j += 2;
      colored(code.slice(i, j), hl.num); i = j; continue;
    }

    if(/[A-Za-z_$@]/.test(ch)){                                     // 标识符 / 关键字
      let j = i + 1;                    // 首字符无条件计入：否则 @ 等不被 idChars 接受的字符会让 j===i 而死循环
      while(j < n && idChars.test(code[j])) j++;
      const word = code.slice(i, j), after = code.slice(j);
      let col = null;
      if(word[0] === '@') col = hl.kw;                                      // CSS at-rule / 装饰器
      else if(kwSet.has(word) || (ci && kwSet.has(word.toLowerCase()))) col = hl.kw;
      else if(/^(true|false|null|nil|None|True|False|undefined|NaN|Infinity)$/.test(word)) col = hl.num;
      else if(isHtml && /<[\/]?$/.test(code.slice(0, i))) col = hl.tag;     // HTML 标签名
      else if((isHtml || isCss || isYaml) && /^\s*[:=]/.test(after)) col = hl.attr;
      else if((L === 'bash' || L === 'php') && word[0] === '$') col = hl.var;
      else if(/^[A-Z][A-Z0-9_]{1,}$/.test(word)) col = hl.tag;              // 类名 / 常量
      else if(/^\s*\(/.test(after)) col = hl.fn;                            // 函数调用
      if(col) colored(word, col); else push(word);
      i = j; continue;
    }

    push(ch); i++;
  }
  return out.join('');
}

/* GitHub 代码配色：代码块 + 行内代码统一语言 */
const GITHUB_LIGHT = {
  bg:'#F6F8FA', fg:'#24292F', border:'#D0D7DE', barBg:'#EFF2F5', barFg:'#57606A',
  inlineBg:'rgba(175,184,193,0.20)', inlineFg:'#24292F', hl:HL_LIGHT
};
const GITHUB_DARK = {
  bg:'#0D1117', fg:'#C9D1D9', border:'#30363D', barBg:'#161B22', barFg:'#8B949E',
  inlineBg:'rgba(110,118,129,0.40)', inlineFg:'#C9D1D9', hl:HL_DARK
};
function codeStyle(ctx){
  const T = S();
  const k = (ctx && ctx.codeStyle) || 'github';
  if(k === 'github-dark') return GITHUB_DARK;
  if(k === 'theme') return {bg:T.codeBg, fg:T.codeFg, border:T.codeBg, barBg:T.codeBar,
                            barFg:'#9FB3AF', inlineBg:T.inlineBg, inlineFg:T.inlineFg, hl:HL_DARK};
  return GITHUB_LIGHT;
}

/* =========================================================
   2. Markdown 解析（零依赖，无 CDN）
   ========================================================= */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* 代码「硬保形」：把空格转 &nbsp;、换行转 <br>，不依赖 white-space:pre。
   微信编辑器会过滤 white-space，导致代码被折叠/自动换行——mdnice 正是靠
   &nbsp; + <br> 绕过该限制。转换只作用于文本节点，绝不能碰标签属性里的空格。 */
function codeRigid(html){
  let out = '', i = 0, n = html.length;
  while(i < n){
    const lt = html.indexOf('<', i);
    if(lt < 0){
      out += rigidText(html.slice(i));
      break;
    }
    if(lt > i) out += rigidText(html.slice(i, lt));
    const gt = html.indexOf('>', lt);
    if(gt < 0){                       // 未闭合的 <，整段按文本处理，避免死循环
      out += rigidText(html.slice(lt));
      break;
    }
    out += html.slice(lt, gt + 1);    // 标签原样透传
    i = gt + 1;
  }
  return out;
}
function rigidText(t){
  // 标签已全部透传，此处只可能是纯文本：空格→&nbsp;，换行→<br>
  return t.replace(/ /g,'&nbsp;').replace(/\n/g,'<br>');
}

/* 优先用 highlight.js（本地已加载时），失败返回 null 让调用方回退到自研高亮 */
function tryHighlightJs(code, lang){
  if(typeof window === 'undefined') return null;          // SSR 阶段无 window
  try{
    if(!window.__HLJS_AVAILABLE__ || typeof hljs === 'undefined' || !hljs.highlight) return null;
    const alias0 = (lang||'').toLowerCase();
    if(!alias0 || !hljs.getLanguage(alias0)) return null;          // 语言不在 highlight.js 里
    // highlight.js 已 configure({style:true})，输出为内联 style，公众号可保留颜色
    const res = hljs.highlight(code, {language:alias0, ignoreIllegals:true});
    return res && res.value ? hljsToInline(res.value) : null;
  }catch(e){ return null; }
}

/* highlight.js 输出 class（v11 的 style:true 对 highlight() 无效），
   这里按 github.min.css 官方配色转成内联 style，公众号才能保留颜色 */
const HLJS_COLORS = {
  'hljs-doctag':'#d73a49','hljs-keyword':'#d73a49','hljs-meta .hljs-keyword':'#d73a49',
  'hljs-template-tag':'#d73a49','hljs-template-variable':'#d73a49','hljs-type':'#d73a49',
  'hljs-variable.language_':'#d73a49',
  'hljs-title':'#6f42c1','hljs-title.class_':'#6f42c1','hljs-title.class_.inherited__':'#6f42c1','hljs-title.function_':'#6f42c1',
  'hljs-attr':'#005cc5','hljs-attribute':'#005cc5','hljs-literal':'#005cc5','hljs-meta':'#005cc5',
  'hljs-number':'#005cc5','hljs-operator':'#005cc5','hljs-selector-attr':'#005cc5',
  'hljs-selector-class':'#005cc5','hljs-selector-id':'#005cc5','hljs-variable':'#005cc5',
  'hljs-meta .hljs-string':'#032f62','hljs-regexp':'#032f62','hljs-string':'#032f62',
  'hljs-built_in':'#e36209','hljs-symbol':'#e36209',
  'hljs-code':'#6a737d','hljs-comment':'#6a737d','hljs-formula':'#6a737d',
  'hljs-name':'#22863a','hljs-quote':'#22863a','hljs-selector-pseudo':'#22863a','hljs-selector-tag':'#22863a',
  'hljs-subst':'#24292e','hljs-section':'#005cc5','hljs-bullet':'#735c0f',
  'hljs-emphasis':'#24292e','hljs-strong':'#24292e','hljs-addition':'#22863a','hljs-deletion':'#b31d28'
};
function hljsToInline(html){
  // <span class="hljs-x ..."> → <span style="color:...">（保留 emphasis/strong 的字体样式）
  return html.replace(/<span class="([^"]+)">/g, (m, cls) => {
    const classes = cls.split(/\s+/);
    let color = '', font = '';
    for(const c of classes){
      if(HLJS_COLORS[c]) color = HLJS_COLORS[c];
      if(c === 'hljs-emphasis') font = 'font-style:italic;';
      if(c === 'hljs-strong')   font = 'font-weight:700;';
    }
    return color || font
      ? `<span style="${font}${color ? 'color:' + color + ';' : ''}">`
      : '<span>';
  });
}

function splitRow(line){
  return line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim());
}
function alignOf(cell){
  const t = cell.trim();
  if(/^:-+:$/.test(t)) return 'center';
  if(/^-+:$/.test(t))  return 'right';
  if(/^:-+$/.test(t))  return 'left';
  return '';
}

class MdParser{
  constructor(lines){ this.lines = lines; this.i = 0; }
  parseUntil(stop){
    const nodes = [];
    while(this.i < this.lines.length){
      if(stop && stop(this.lines[this.i])) return nodes;
      const before = this.i;
      const n = this.parseBlock();
      // 保险：任何分支都必须让行号前进，否则外层会反复解析同一行而死循环
      if(this.i === before) this.i++;
      if(n) nodes.push(n);
    }
    return nodes;
  }
  parseBlock(){
    const line = this.lines[this.i];
    if(!line.trim()){ this.i++; return null; }
    let m;
    // 代码块（语言标记放宽到 \w + # . - ，兼容 c++ / c# / objective-c 等）
    if(m = /^```\s*([\w+#.\-]*)\s*$/.exec(line)){
      const lang = m[1]; this.i++;
      const buf = [];
      while(this.i < this.lines.length && !/^```\s*$/.test(this.lines[this.i])) buf.push(this.lines[this.i++]);
      this.i++;
      return {t:'code', lang, text:buf.join('\n')};
    }
    // 容器 :::
    if(m = /^:::\s*([\w-]+)\s*(.*)$/.exec(line)){
      const type = m[1].toLowerCase(), arg = (m[2]||'').trim(); this.i++;
      const children = this.parseUntil(l => /^:::\s*$/.test(l));
      this.i++;
      return {t:'container', type, arg, children};
    }
    // 标题
    if(m = /^(#{1,6})\s+(.*)$/.exec(line)){ this.i++; return {t:'h', level:m[1].length, text:m[2]}; }
    // 分割线
    if(/^(\s*)([-*_])(\s*\2){2,}\s*$/.test(line)){ this.i++; return {t:'hr'}; }
    // 引用
    if(/^\s*>/.test(line)){
      const buf = [];
      while(this.i < this.lines.length && /^\s*>/.test(this.lines[this.i]))
        buf.push(this.lines[this.i++].replace(/^\s*>\s?/,''));
      return {t:'quote', children:new MdParser(buf).parseUntil(null)};
    }
    // 表格
    if(/^\s*\|.*\|\s*$/.test(line) && this.i+1 < this.lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(this.lines[this.i+1])){
      const head = splitRow(line);
      const align = splitRow(this.lines[this.i+1]).map(alignOf);
      this.i += 2;
      const rows = [];
      while(this.i < this.lines.length && /^\s*\|.*\|\s*$/.test(this.lines[this.i])) rows.push(splitRow(this.lines[this.i++]));
      return {t:'table', head, align, rows};
    }
    // 列表
    if(/^\s*([-*+]|\d+[.)])\s+/.test(line)) return this.parseList();
    // 独立图片
    if(m = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/.exec(line)){
      this.i++; return {t:'image', alt:m[1], src:m[2]};
    }
    // 段落
    const buf = [];
    while(this.i < this.lines.length){
      const l = this.lines[this.i];
      if(!l.trim()) break;
      // 关键：buf 为空时（即段落首行）不得 break，否则本行不被消费会死循环
      if(buf.length){
        if(/^(#{1,6}\s|```|:::|\s*>|\s*([-*+]|\d+[.)])\s)/.test(l)) break;
        if(/^!\[[^\]]*\]\([^)]*\)\s*$/.test(l)) break;
        if(/^\s*\|.*\|\s*$/.test(l)) break;
        if(/^(\s*)([-*_])(\s*\2){2,}\s*$/.test(l)) break;
      }
      buf.push(l); this.i++;
    }
    return {t:'p', text:buf.join('\n')};
  }
  parseList(){
    const items = [];
    const re = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
    let ordered = false, start = 1;
    while(this.i < this.lines.length){
      const m = re.exec(this.lines[this.i]);
      if(!m){
        if(items.length && /^\s+\S/.test(this.lines[this.i])){
          items[items.length-1].text += '\n' + this.lines[this.i].trim(); this.i++; continue;
        }
        break;
      }
      if(/\d+[.)]/.test(m[2])){ if(!ordered && !items.length) start = parseInt(m[2],10); ordered = true; }
      let text = m[3], checked = null;
      const task = /^\[( |x|X)\]\s+(.*)$/.exec(text);
      if(task){ checked = task[1].toLowerCase() === 'x'; text = task[2]; }
      items.push({text, checked});
      this.i++;
    }
    return {t:'list', ordered, start, items};
  }
}

function parseMarkdown(src){
  // 去掉 YAML front matter
  src = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const lines = src.replace(/\r\n?/g,'\n').split('\n');
  return new MdParser(lines).parseUntil(null);
}

/* =========================================================
   3. 行内解析
   ========================================================= */
function inline(str, ctx){
  const rules = [
    {re:/`([^`]+)`/g, fn:m => `<code style="${S(ctx).inlineCode}">${esc(m[1])}</code>`},
    {re:/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
     fn:m => `<img src="${imgSrc(m[2])}" alt="${esc(m[1])}" style="width:100%;border-radius:6px;display:block;margin:6px auto">`},
    {re:/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
     fn:(m, rec) => {
        const T = S(ctx);
        const urlPart = ctx.showUrl
          ? `<span style="color:${T.muted};font-size:12px"> · ${esc(m[2])}</span>` : '';
        return `<a href="${esc(m[2])}" target="_blank" style="color:${T.accent};border-bottom:1px solid ${T.accent}40;padding-bottom:1px;text-decoration:none">${rec(m[1])}</a>${urlPart}`;
     }},
    {re:/\*\*([^*]+)\*\*/g, fn:(m, rec) => `<strong style="color:${S(ctx).primary};font-weight:600">${rec(m[1])}</strong>`},
    {re:/__([^_]+)__/g,     fn:(m, rec) => `<strong style="color:${S(ctx).primary};font-weight:600">${rec(m[1])}</strong>`},
    {re:/~~([^~]+)~~/g,     fn:m => `<span style="text-decoration:line-through;color:${S(ctx).muted}">${esc(m[1])}</span>`},
    {re:/==([^=]+)==/g,     fn:(m, rec) => `<span style="background:linear-gradient(transparent 62%, ${S(ctx).accent}33 0);padding:0 1px">${rec(m[1])}</span>`},
    {re:/\*([^*\n]+)\*/g, fn:(m, rec) => `<em style="font-style:normal;color:${S(ctx).muted}">${rec(m[1])}</em>`},
    {re:/_([^_\n]+)_/g,   fn:(m, rec) => `<em style="font-style:normal;color:${S(ctx).muted}">${rec(m[1])}</em>`}
  ];
  let res = '', i = 0;
  while(i < str.length){
    let best = null, bestIdx = Infinity;
    for(const r of rules){
      r.re.lastIndex = i;
      const m = r.re.exec(str);
      if(m && m.index < bestIdx){ bestIdx = m.index; best = {r, m}; }
    }
    if(!best){ res += esc(str.slice(i)); break; }
    if(bestIdx > i) res += esc(str.slice(i, bestIdx));
    res += best.r.fn(best.m, s => inline(s, ctx));
    i = bestIdx + best.m[0].length;
  }
  return res;
}

/* =========================================================
   4. 渲染为公众号 HTML（全部内联样式）
   ========================================================= */
let CUR = THEMES.moqing;
const S = () => CUR;
/* h2 序号计数器：「number」「bignum」样式使用，buildHtml 每次渲染前清零 */
let H2N = 0;

/* ⚠️ 字体名必须用单引号：这两个常量会被插入 style="..." 属性，
   内部若用双引号会提前闭合 style 属性，导致其后所有样式（含 overflow、background）全部失效。
   这是此前「代码块滚动条不生效 / 复制到公众号有背景色」的根本原因。 */
const FONT = "-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue','Microsoft YaHei',Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Consolas,'Courier New',monospace";

/* dataURL → blob URL 缓存：避免每次重渲染都让浏览器重新解码几 MB 的 base64 */
const blobCache = new Map();
function imgSrc(src){
  if(!/^data:/.test(src)) return src;
  if(blobCache.has(src)) return blobCache.get(src);
  if(typeof URL === 'undefined' || !URL.createObjectURL || typeof atob === 'undefined') return src;
  try{
    const bin = atob(src.split(',')[1]);
    const arr = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    // 从 data URI 取真实 MIME，不能硬编码 image/png（否则 SVG 会被当 PNG 解码而显示失败）
    const mime = /^data:([^;,]+)/.exec(src);
    const url = URL.createObjectURL(new Blob([arr], {type: mime ? mime[1] : 'image/png'}));
    blobCache.set(src, url);
    return url;
  }catch(e){ return src; }
}

function px(v){ return v + 'px'; }

function renderNodes(nodes, ctx, inContainer){
  return nodes.map((n, idx) => renderNode(n, ctx, inContainer && idx === 0)).join('');
}

function renderNode(n, ctx, isFirst){
  const T = S();
  const fs = ctx.fontSize;
  const mt = isFirst ? 0 : null;
  switch(n.t){
    case 'h': {
      const txt = inline(n.text, ctx);
      const hs = ctx.headingStyle || 'default';
      if(n.level === 1){
        return `<h1 style="margin:${mt===0?0:30}px 0 6px;font-size:${fs+8}px;line-height:1.45;font-weight:700;color:${T.primary};text-align:center;letter-spacing:1px;background:transparent">${txt}</h1>`
             + `<p style="text-align:center;margin:0 0 26px;line-height:0;background:transparent"><span style="display:inline-block;width:44px;height:2px;background:${T.accent}">&nbsp;</span></p>`;
      }
      if(n.level === 2){
        const fs2 = fs + 3;
        const m2 = `${mt===0?0:30}px 0 14px`;

        if(hs === 'bignum'){
          // 大序号留白：60px 淡色衬线序号 + 斜杠分隔 + 标题文本，序号与标题底部对齐
          H2N++;
          const no = String(H2N).padStart(2, '0');
          return `<section style="margin:${m2};line-height:0;background:transparent">`
               + `<span style="display:inline-block;vertical-align:baseline;font-family:'Jetbrains Mono',Georgia,'Times New Roman',serif;font-style:italic;font-size:80px;font-weight:700;color:${T.accent};opacity:.32;line-height:1;letter-spacing:1px">${no}</span>`
               + `<span style="display:inline-block;vertical-align:baseline;font-family:'Jetbrains Mono'，Georgia,'Times New Roman',serif;font-style:italic;font-size:36px;font-weight:400;color:${T.accent};opacity:.5;line-height:1;margin:0 15px 0 12px">/</span>`
               + `<span style="display:inline-block;vertical-align:baseline;font-size:${fs2}px;line-height:1.5;font-weight:700;color:${T.primary};letter-spacing:.5px">${txt}</span></section>`;
        }
        if(hs === 'number'){
          // 序号衬线：大号衬线斜体序号 + 半透明竖条 + 标题 + 通栏发丝线，杂志目录感
          H2N++;
          const no = String(H2N).padStart(2, '0');
          return `<h2 style="margin:${m2};border-bottom:1px solid ${T.line};padding-bottom:10px;line-height:1.5;background:transparent">`
               + `<span style="display:inline-block;vertical-align:middle;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:${fs+11}px;font-weight:700;color:${T.accent};line-height:1;margin-right:10px">${no}</span>`
               + `<span style="display:inline-block;vertical-align:middle;width:3px;height:${fs+3}px;background:${T.accent};opacity:.35;border-radius:2px;margin-right:12px">&nbsp;</span>`
               + `<span style="display:inline-block;vertical-align:middle;font-size:${fs2}px;font-weight:700;color:${T.primary};letter-spacing:.5px">${txt}</span></h2>`;
        }
        if(hs === 'frame'){
          // 居中线框：细线圆角框内嵌菱形点缀，印章式排版
          return `<section style="margin:${m2};text-align:center;line-height:0;background:transparent">`
               + `<section style="display:inline-block;border:1px solid ${T.accent};border-radius:8px;padding:9px 26px;line-height:1.5">`
               + `<span style="color:${T.accent};font-size:11px;vertical-align:middle;margin-right:11px">◆</span>`
               + `<span style="display:inline-block;vertical-align:middle;font-size:${fs2}px;font-weight:700;color:${T.primary};letter-spacing:2px">${txt}</span>`
               + `<span style="color:${T.accent};font-size:11px;vertical-align:middle;margin-left:11px">◆</span>`
               + `</section></section>`;
        }
        if(hs === 'dual'){
          // 双线夹字：两侧「粗+细」双线，居中，仪式感强
          const side = `display:inline-block;vertical-align:middle;width:36px;height:9px;border-top:3px solid ${T.accent};border-bottom:1px solid ${T.accent};box-sizing:border-box`;
          return `<section style="margin:${m2};text-align:center;line-height:0;background:transparent">`
               + `<span style="${side}">&nbsp;</span>`
               + `<span style="display:inline-block;vertical-align:middle;margin:0 14px;font-size:${fs2}px;font-weight:700;color:${T.primary};letter-spacing:1.5px">${txt}</span>`
               + `<span style="${side}">&nbsp;</span></section>`;
        }
        if(hs === 'fade'){
          // 渐变底纹：主题色由深到浅横向渐隐 + 左侧实条，比纯色块更透气
          return `<h2 style="margin:${m2};font-size:${fs2}px;line-height:1.5;font-weight:700;color:${T.primary};background:linear-gradient(90deg, ${T.accentSoft}, rgba(255,255,255,0));border-left:4px solid ${T.accent};padding:9px 14px;border-radius:0 8px 8px 0;letter-spacing:.5px">${txt}</h2>`;
        }
        if(hs === 'diamond'){
          // 菱形对称：居中 + 宽字距 + 两端菱形与细横线，东方美学
          return `<section style="margin:${m2};text-align:center;line-height:0;background:transparent">`
               + `<span style="display:inline-block;vertical-align:middle;width:22px;height:1px;background:${T.line}">&nbsp;</span>`
               + `<span style="color:${T.accent};font-size:10px;vertical-align:middle;margin:0 9px">◆</span>`
               + `<span style="display:inline-block;vertical-align:middle;margin:0 5px;font-size:${fs2}px;font-weight:700;color:${T.primary};letter-spacing:4px">${txt}</span>`
               + `<span style="color:${T.accent};font-size:10px;vertical-align:middle;margin:0 9px">◆</span>`
               + `<span style="display:inline-block;vertical-align:middle;width:22px;height:1px;background:${T.line}">&nbsp;</span></section>`;
        }
        if(hs === 'underline'){
          // 短下划线：仅文字底部一段主题色短线，最克制
          return `<h2 style="margin:${m2};line-height:1.5;background:transparent">`
               + `<span style="display:inline-block;font-size:${fs2}px;font-weight:700;color:${T.primary};letter-spacing:.5px;border-bottom:3px solid ${T.accent};padding-bottom:4px">${txt}</span></h2>`;
        }
        // default：左侧金条（原有样式）
        return `<h2 style="margin:${m2};font-size:${fs2}px;line-height:1.5;font-weight:700;color:${T.primary};border-left:4px solid ${T.accent};padding-left:11px;letter-spacing:.5px;background:transparent">${txt}</h2>`;
      }
      if(n.level === 3){
        // 三级标题不参与样式切换，固定使用原有样式（■ 前缀）
        const fs3 = fs + 1;
        return `<h3 style="margin:${mt===0?0:24}px 0 12px;font-size:${fs3}px;line-height:1.5;font-weight:600;color:${T.primary};background:transparent">`
             + `<span style="color:${T.accent};margin-right:6px">■</span>${txt}</h3>`;
      }
      return `<h${n.level} style="margin:${mt===0?0:20}px 0 10px;font-size:${fs}px;font-weight:600;color:${T.accent};line-height:1.6;background:transparent">${txt}</h${n.level}>`;
    }
    case 'p':
      return `<p style="margin:${mt===0?0:0} 0 ${Math.round(fs*1.25)}px;font-size:${fs}px;line-height:1.8;color:${T.ink};letter-spacing:.3px;text-align:justify;word-break:break-word;background:transparent">`
           + inline(n.text, ctx).replace(/\n/g,'<br>') + `</p>`;

    case 'hr':
      return `<p style="text-align:center;margin:${mt===0?0:26}px 0 ${mt===0?26:26}px;line-height:0;background:transparent">`
           + `<span style="display:inline-block;width:52px;height:1px;background:${T.line}">&nbsp;</span>`
           + `<span style="display:inline-block;width:5px;height:5px;background:${T.accent};border-radius:50%;margin:0 8px;vertical-align:middle">&nbsp;</span>`
           + `<span style="display:inline-block;width:52px;height:1px;background:${T.line}">&nbsp;</span></p>`;

    case 'quote': {
      const inner = renderNodes(n.children, ctx, true);
      const qs = ctx.quoteStyle || 'default';
      const m0 = `${mt===0?0:20}px`;
      const body = color => `<div style="font-size:${fs-1}px;line-height:1.8;color:${color};letter-spacing:.3px">${inner}</div>`;
      if(qs === 'plain'){
        // 极简竖线：无底色，仅一条灰竖线 + 弱化文字，正文引用短句时最干净
        return `<section style="margin:${m0} 0 ${m0};padding:2px 0 2px 14px;border-left:2px solid ${T.line};background:transparent">${body(T.muted)}</section>`;
      }
      if(qs === 'card'){
        // 白卡描边：白底卡片 + 左侧主题色粗条，与 ::: card 容器视觉统一
        return `<section style="margin:${m0} 0 ${m0};padding:14px 16px;background:#FFFFFF;border:1px solid ${T.line};border-left:4px solid ${T.accent};border-radius:8px">${body('#6E6E6E')}</section>`;
      }
      if(qs === 'dark'){
        // 深色块：主题色整块铺底 + 浅色文字，视觉最重，适合金句
        return `<section style="margin:${m0} 0 ${m0};padding:15px 17px;background:${T.primary};border-radius:8px">${body('#D5D0C5')}</section>`;
      }
      if(qs === 'mark'){
        // 引号点缀：浅底圆角块 + 顶部大引号，文艺风格
        return `<section style="margin:${m0} 0 ${m0};padding:12px 16px 14px;background:${T.soft};border-radius:8px">`
             + `<p style="margin:0 0 2px;font-size:30px;line-height:1;color:${T.accent};font-family:Georgia,'Times New Roman',serif">&ldquo;</p>`
             + body('#6E6E6E') + `</section>`;
      }
      // default：金条浅底（原有样式）
      return `<section style="margin:${m0} 0 ${m0};padding:13px 15px;background:${T.soft};border-left:3px solid ${T.accent};border-radius:0 6px 6px 0">`
           + body('#6E6E6E') + `</section>`;
    }

    case 'list': {
      const items = n.items.map((it, idx) => {
        const content = inline(it.text, ctx).replace(/\n/g,'<br>');
        let mark;
        if(it.checked !== null){
          mark = `<span style="display:inline-block;width:14px;height:14px;line-height:14px;text-align:center;border:1px solid ${T.accent};border-radius:3px;font-size:10px;color:${T.accent};margin-right:9px;vertical-align:1px">${it.checked ? '✓' : ''}</span>`;
        } else if(n.ordered){
          mark = `<span style="display:inline-block;min-width:18px;height:18px;line-height:18px;text-align:center;background:${T.accentSoft};color:${T.accent};font-size:11px;font-weight:600;border-radius:4px;margin-right:9px;vertical-align:2px">${n.start + idx}</span>`;
        } else {
          mark = `<span style="color:${T.accent};margin-right:8px">●</span>`;
        }
        return `<p style="margin:0 0 9px;font-size:${fs}px;line-height:1.8;color:${T.ink};letter-spacing:.3px;background:transparent">${mark}${content}</p>`;
      }).join('');
      return `<section style="margin:${mt===0?0:0} 0 ${Math.round(fs*1.25)}px;padding-left:2px">${items}</section>`;
    }

    case 'code': {
      const cs = codeStyle(ctx);
      let code;
      if(ctx.hl){
        // highlight.js 配色是 GitHub 浅色版，仅在浅色代码主题下使用；深色/跟随主题用自研（随主题取色）
        code = (ctx.codeStyle === 'github' || ctx.codeStyle == null)
              ? (tryHighlightJs(n.text, n.lang) || highlight(n.text, n.lang, cs.hl))
              : highlight(n.text, n.lang, cs.hl);
      } else {
        code = esc(n.text);
      }
      // 去尾部换行，避免末尾多一个空行；再做「硬保形」（空格→&nbsp;、换行→<br>）
      const rigid = codeRigid(String(code).replace(/\n+$/,''));
      const bar = n.lang
        ? `<p style="margin:0;padding:7px 14px;background:${cs.barBg};color:${cs.barFg};font-size:11px;letter-spacing:1px;font-family:${MONO};border:1px solid ${cs.border};border-bottom:0;border-radius:6px 6px 0 0">${esc(n.lang.toUpperCase())}</p>`
        : '';
      const radius = n.lang ? '0 0 6px 6px' : '6px';
      // 结构与 mdnice 对齐：<pre> 只作 padding:0 的容器；滚动条在 <code> 上（display:-webkit-box + overflow-x:auto）
      // 关键：不依赖 white-space（微信会过滤），靠 &nbsp; + <br> 保证不换行
      return `<section style="margin:${mt===0?0:18}px 0 ${mt===0?0:18}px;max-width:100%;overflow:hidden;display:block">${bar}`
           + `<pre style="margin:0;padding:0;background:${cs.bg};color:${cs.fg};border:1px solid ${cs.border};border-radius:${radius};max-width:100%;width:100%;min-width:0;box-sizing:border-box;display:block;-webkit-text-size-adjust:100%"><code style="display:-webkit-box;font-family:${MONO};font-size:13px;line-height:1.7;padding:14px 15px;overflow-x:auto;overflow-y:hidden">${rigid}</code></pre></section>`;
    }

    case 'image': {
      const src = imgSrc(n.src);
      return `<p style="margin:${mt===0?0:16}px 0 6px;text-align:center;background:transparent"><img src="${src}" alt="${esc(n.alt)}" style="width:100%;border-radius:6px;display:block"></p>`
           + (n.alt ? `<p style="text-align:center;font-size:12px;color:${T.muted};margin:0 0 16px;background:transparent">${esc(n.alt)}</p>` : '');
    }

    case 'table': {
      const A = n.align || [];
      const th = n.head.map((c, i) =>
        `<th style="padding:9px 10px;background:${T.primary};color:#FFFFFF;font-weight:600;font-size:${fs-1}px;text-align:${A[i]||'left'};border-bottom:1px solid ${T.primary}">${inline(c, ctx)}</th>`
      ).join('');
      const tb = n.rows.map((row, r) => {
        const tds = row.map((c, i) =>
          `<td style="padding:9px 10px;font-size:${fs-1}px;color:${T.ink};line-height:1.7;text-align:${A[i]||'left'};border-bottom:1px solid ${T.line};background:${r%2 ? T.soft : '#FFFFFF'}">${inline(c, ctx)}</td>`
        ).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<section style="margin:${mt===0?0:18}px 0 ${mt===0?0:18}px;overflow-x:auto">`
           + `<table style="width:100%;border-collapse:collapse;font-size:${fs-1}px"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></section>`;
    }

    case 'container':
      return renderContainer(n, ctx, isFirst);

    default: return '';
  }
}
/* 说明：S() 返回当前主题配色对象，CUR.inlineCode 由 buildHtml() 在渲染前注入 */

function renderContainer(n, ctx, isFirst){
  const T = S();
  const fs = ctx.fontSize;
  const body = renderNodes(n.children, ctx, true);
  const m0 = isFirst ? 0 : 20;

  if(n.type === 'archive') return renderArchive(n, ctx, isFirst);
  if(n.type === 'follow')  return renderFollow(n, ctx, isFirst);

  /* 轮播图集 ::: carousel
     公众号无 JS，用「横向滚动容器 + flex 定宽子项」实现手动轮播。
     ⚠️ 关键：绝不能出现任何「宽度 > 100%」的元素。
        公众号正文有全局规则 .rich_media_content *{max-width:100%!important}，
        会强行把 width:300% 的滑动轨道压回 100%，N 张图被挤成一行平铺、且滚不动
        ——这正是「本地预览正常、粘进公众号就横着平铺」的原因。
        改法：滚动容器本身 100% 宽 + display:flex，每张 slide 也是 100% 宽且不可收缩
        （flex:0 0 100% / min-width:100%），靠 flex 不压缩撑出 N 倍内容宽度，
        元素自身宽度都不越界，max-width 就再也压不到它。
        （同理不能依赖 white-space:nowrap，公众号会过滤该属性。） */
  if(n.type === 'carousel'){
    const imgs = n.children.filter(c => c.t === 'image');
    if(!imgs.length) return '';
    const cnt = imgs.length;
    const slides = imgs.map((im, i) => {
      const src = imgSrc(im.src);
      const alt = esc(im.alt || '');
      const pad = i < cnt - 1 ? 'padding-right:10px;' : '';   // 末张不留白，露出下一张边缘
      const cap = im.alt
        ? `<p style="margin:7px 0 0;font-size:${fs-2}px;color:${T.muted};text-align:center;line-height:1.6">${inline(im.alt, ctx)}</p>`
        : '';
      // flex:0 0 100% + min-width:100% 双保险：任一被过滤都不会被压缩成平铺
      return `<section style="flex:0 0 100%;flex-shrink:0;width:100%;min-width:100%;max-width:100%;box-sizing:border-box;scroll-snap-align:start;${pad}">`
           + `<img src="${src}" alt="${alt}" style="width:100%;display:block;border-radius:6px">${cap}</section>`;
    }).join('');
    const hint = `<p style="margin:9px 0 0;font-size:${fs-3}px;color:${T.muted};text-align:center;letter-spacing:.5px">← 左右滑动查看全部 ${cnt} 张 →</p>`;
    // 单层滚动容器即可：元素宽度都不超过 100%，只有内容溢出 → 可横向滑动
    return `<section style="margin:${m0}px 0 ${m0}px">`
         + `<section style="display:-webkit-box;display:flex;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory">`
         + slides
         + `</section>` + hint + `</section>`;
  }

  if(n.type === 'tags'){
    const raw = n.children.map(c => c.text || '').join('\n');
    const tags = raw.split(/[,，、|\n·\/]+/).map(s => s.trim()).filter(Boolean);
    const pills = tags.map(t =>
      `<span style="display:inline-block;padding:3px 11px;margin:0 7px 7px 0;border:1px solid ${T.accent}55;color:${T.accent};background:${T.accentSoft};border-radius:20px;font-size:12px;line-height:1.6">${inline(t, ctx)}</span>`
    ).join('');
    return `<p style="margin:${m0}px 0 ${m0}px;line-height:1.8">${pills}</p>`;
  }

  if(n.type === 'card'){
    const title = n.arg ? `<p style="margin:0 0 10px;font-size:${fs+1}px;font-weight:700;color:${T.primary}">${inline(n.arg, ctx)}</p>` : '';
    return `<section style="margin:${m0}px 0 ${m0}px;padding:16px 17px;background:#FFFFFF;border:1px solid ${T.line};border-left:4px solid ${T.accent};border-radius:8px">`
         + title + `<div style="font-size:${fs}px;line-height:1.8;color:${T.ink}">${body}</div></section>`;
  }

  const presets = {
    tip : {bg:T.accentSoft, bar:T.accent,    fg:'#6B5B3E', label:'提示'},
    info: {bg:T.soft,       bar:T.primary,   fg:'#5A5A5A', label:'说明'},
    warn: {bg:'#FBF0EC',    bar:'#B4603F',   fg:'#7A4B38', label:'注意'}
  };
  const p = presets[n.type] || presets.info;
  const head = n.arg
    ? `<p style="margin:0 0 8px;font-size:${fs}px;font-weight:600;color:${p.bar}">${inline(n.arg, ctx)}</p>`
    : `<p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;color:${p.bar};opacity:.85">${p.label}</p>`;
  return `<section style="margin:${m0}px 0 ${m0}px;padding:14px 16px;background:${p.bg};border-left:3px solid ${p.bar};border-radius:0 6px 6px 0">`
       + head + `<div style="font-size:${fs-1}px;line-height:1.8;color:${p.fg}">${body}</div></section>`;
}

/* ---------------------------------------------------------
   往期推荐 ::: archive
   4 种样式：dash 虚线框 / card 卡片列表 / plain 简约条目 / dark 深色块
   --------------------------------------------------------- */
function parseArchiveItems(nodes){
  const items = [];
  const push = raw => {
    const s = String(raw).replace(/^\s*[-*]\s*/, '').trim();
    if(!s) return;
    const m = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(s);
    if(m) items.push({title:m[1], url:m[2]});
    else items.push({title:s, url:''});
  };
  nodes.forEach(n => {
    if(n.t === 'list') n.items.forEach(it => push(it.text));
    else if(n.t === 'p') n.text.split('\n').forEach(push);
  });
  return items;
}

function renderArchive(n, ctx, isFirst){
  const T = S(), fs = ctx.fontSize;
  const items = parseArchiveItems(n.children);
  const m0 = isFirst ? 0 : 24;
  const st = ctx.archiveStyle || 'dash';
  const title = n.arg || '往期推荐';
  const head = `<p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;color:${T.accent};font-weight:600">${inline(title, ctx)}</p>`;

  const rows = items.map((it, i) => {
    const txt = inline(it.title, ctx);
    // 公众号正文中 mp.weixin.qq.com 链接可点击跳转，因此保留 <a>
    const label = it.url
      ? `<a href="${it.url}" style="color:inherit;text-decoration:none">${txt}</a>`
      : txt;
    const no = String(i + 1).padStart(2, '0');

    if(st === 'card'){
      return `<p style="margin:0 0 8px;padding:11px 13px;background:#FFFFFF;border:1px solid ${T.line};border-left:3px solid ${T.accent};border-radius:6px;font-size:${fs-1}px;line-height:1.6">`
        + `<span style="display:inline-block;min-width:22px;color:${T.accent};font-size:12px;font-weight:600">${no}</span>`
        + `<span style="color:${T.ink}">${label}</span>`
        + `<span style="color:${T.muted};font-size:12px"> ›</span></p>`;
    }
    if(st === 'plain'){
      return `<p style="margin:0;padding:10px 0;border-bottom:1px solid ${T.line};font-size:${fs-1}px;line-height:1.6">`
        + `<span style="color:${T.accent};margin-right:8px">●</span>`
        + `<span style="color:${T.ink}">${label}</span></p>`;
    }
    if(st === 'dark'){
      return `<p style="margin:0 0 7px;padding:10px 13px;background:${T.primaryLight};border-radius:6px;font-size:${fs-1}px;line-height:1.6">`
        + `<span style="display:inline-block;min-width:22px;color:${T.accent};font-size:12px;font-weight:600">${no}</span>`
        + `<span style="color:#E7E1D5">${label}</span></p>`;
    }
    // dash：虚线框（默认，最接近常见「往期推荐」样式）
    return `<p style="margin:0;padding:8px 0;border-bottom:1px dashed ${T.line};font-size:${fs-1}px;line-height:1.6">`
      + `<span style="color:${T.ink}">${label}</span></p>`;
  }).join('');

  if(st === 'card')
    return `<section style="margin:${m0}px 0 ${m0}px">${head}${rows}</section>`;
  if(st === 'plain')
    return `<section style="margin:${m0}px 0 ${m0}px;padding:14px 0 0;border-top:1px solid ${T.line}">${head}${rows}</section>`;
  if(st === 'dark')
    return `<section style="margin:${m0}px 0 ${m0}px;padding:17px 18px;background:${T.primary};border-radius:8px">${head}${rows}</section>`;
  return `<section style="margin:${m0}px 0 ${m0}px;padding:15px 17px;background:#FFFFFF;border:1px dashed ${T.line};border-radius:8px">${head}${rows}</section>`;
}

/* ---------------------------------------------------------
   关注引导 ::: follow
   3 种样式：card 居中卡片 / quote 左侧金条 / dark 深色块
   用法：::: follow 号名  换行后每行一句文案
   --------------------------------------------------------- */
function renderFollow(n, ctx, isFirst){
  const T = S(), fs = ctx.fontSize;
  const m0 = isFirst ? 0 : 26;
  const st = ctx.followStyle || 'card';
  const name = n.arg || '听风入画';
  const lines = n.children.map(c => c.text || '').join('\n').split('\n').map(s => s.trim()).filter(Boolean);
  const bodyInk  = lines.map(l => `<p style="margin:0 0 5px;font-size:${fs-1}px;line-height:1.75;color:#6E6E6E">${inline(l, ctx)}</p>`).join('');
  const bodyDark = lines.map(l => `<p style="margin:0 0 5px;font-size:${fs-1}px;line-height:1.75;color:#C9C3B6">${inline(l, ctx)}</p>`).join('');

  if(st === 'quote'){
    return `<section style="margin:${m0}px 0 ${m0}px;padding:15px 17px;background:${T.soft};border-left:3px solid ${T.accent};border-radius:0 6px 6px 0">`
      + `<p style="margin:0 0 8px;font-size:${fs+1}px;font-weight:700;color:${T.primary}">${inline(name, ctx)}</p>${bodyInk}</section>`;
  }
  if(st === 'dark'){
    return `<section style="margin:${m0}px 0 ${m0}px;padding:18px 19px;background:${T.primary};border-radius:8px">`
      + `<p style="margin:0 0 8px;font-size:${fs+2}px;font-weight:700;color:${T.accent};letter-spacing:1px">${inline(name, ctx)}</p>${bodyDark}`
      + `<p style="margin:12px 0 0;line-height:0"><span style="display:inline-block;width:40px;height:2px;background:${T.accent}">&nbsp;</span></p></section>`;
  }
  return `<section style="margin:${m0}px 0 ${m0}px;padding:18px 19px;background:#FFFFFF;border:1px solid ${T.line};border-top:3px solid ${T.accent};border-radius:8px;text-align:center">`
    + `<p style="margin:0 0 6px;font-size:${fs+2}px;font-weight:700;color:${T.primary};letter-spacing:2px">${inline(name, ctx)}</p>`
    + `<p style="margin:0 0 13px;line-height:0"><span style="display:inline-block;width:36px;height:2px;background:${T.accent}">&nbsp;</span></p>`
    + bodyInk + `</section>`;
}

function buildHtml(src, themeKey, fontSize, showUrl, archiveStyle, followStyle, codeStyleKey, hl, headingStyle, quoteStyle){
  // 参数兜底：缺参时避免输出 "undefinedpx" 之类的坏样式（布尔参数不能用 ||，会吞掉 false）
  fontSize = Number(fontSize) || 15;
  showUrl  = showUrl  !== undefined ? showUrl  : true;
  hl       = hl       !== undefined ? hl       : true;
  CUR = THEMES[themeKey] || THEMES.moqing;
  H2N = 0;
  const ctx = {fontSize, showUrl, archiveStyle, followStyle, codeStyle:codeStyleKey, hl:hl !== false,
               headingStyle:headingStyle || 'default', quoteStyle:quoteStyle || 'default'};
  const cs = codeStyle(ctx);
  CUR.inlineCode = `background:${cs.inlineBg};color:${cs.inlineFg};padding:.2em .4em;border-radius:6px;font-family:${MONO};font-size:${(fontSize-2)}px`;
  const nodes = parseMarkdown(src);
  const body = renderNodes(nodes, ctx, false);
  return `<section style="font-family:${FONT};font-size:${fontSize}px;color:${CUR.ink};line-height:1.8;letter-spacing:.3px;padding:0 1px;word-break:break-word;background:#FFFFFF">${body}</section>`;
}

export { THEMES, buildHtml, esc };
