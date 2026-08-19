import type { Order } from "./types";
import { Lunar, LunarMonth } from "lunar-javascript";

/* ============== 农历节日判断 ============== */
function lunarMonthDay(date: Date): { month: number; day: number; dayCount: number } {
  const lunar = Lunar.fromDate(date);
  const month = lunar.getMonth();
  const day = lunar.getDay();
  const dayCount = LunarMonth.fromYm(lunar.getYear(), month).getDayCount();
  return { month, day, dayCount };
}
function isQixi(date: Date): boolean {
  const { month, day } = lunarMonthDay(date);
  return month === 7 && day === 7;
}
/** 农历八月十五：中秋 */
function isMidAutumn(date: Date): boolean {
  const { month, day } = lunarMonthDay(date);
  return month === 8 && day === 15;
}
/** 农历除夕：腊月（12月）最后一天 */
function isNewYearEve(date: Date): boolean {
  const { month, day, dayCount } = lunarMonthDay(date);
  return month === 12 && day === dayCount;
}

/* ============== 公共工具 ============== */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 内联 SVG -> data URI */
function svgUri(markup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(markup.replace(/\s+/g, " ").trim())}`;
}

/** 按菜名从菜品库兜底取价（兼容旧订单 items 缺 price 的情况） */
import { dishes as dishLibrary } from "./data";
function lookupPrice(name: string): number | undefined {
  const found = dishLibrary.find((d) => d.name === name);
  return found ? found.price : undefined;
}

/* ============== 订单内容（与主题无关，纯数据） ============== */
/** 预点菜按周一到周五分组展示 */
function buildPreDayBlocks(order: Order, headerColor: string): string {
  const days = order.preDays && order.preDays.length ? order.preDays : [];
  if (!days.length) {
    return `<p style="color:#99805a;font-size:14px;margin:4px 0 0;">（未安排任何菜品）</p>`;
  }
  return days
    .map((d) => {
      const dishList =
        d.dishes && d.dishes.length
          ? d.dishes
              .map(
                (name, i) => `
                <div style="display:flex;align-items:center;padding:7px 12px;border-bottom:${i === d.dishes.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)"};">
                  <span style="flex:1;color:#1a1a1a;font-size:14px">${escapeHtml(name)}</span>
                  <span style="color:#666;font-size:13px;">x1</span>
                </div>`,
              )
              .join("")
          : `<div style="padding:9px 12px;color:#b59b73;font-size:13px;">（未安排）</div>`;
      return `
        <div style="background:#fff;border-radius:12px;overflow:hidden;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:${headerColor}">
            <span style="color:inherit;opacity:0.9;font-size:14px;">${escapeHtml(d.day)}</span>
            <span style="color:inherit;opacity:0.75;font-size:12px;">${escapeHtml(d.date || "")}</span>
          </div>
          ${dishList}
        </div>`;
    })
    .join("");
}

/** 订单明细 HTML（直接点菜/预点菜通用布局） */
function buildDetailHtml(order: Order, headerColor: string, bodyColor: string): string {
  const typeText = order.type === "preorder" ? "预点菜（本周）" : "直接点菜";
  let detailHtml: string;
  if (order.type === "preorder") {
    detailHtml = `
        <p style="color:#999;font-size:13px;margin:0 0 10px;">本周安排（周一到周五）</p>
        ${buildPreDayBlocks(order, headerColor)}`;
  } else {
    const rows = order.items
      .map((it) => {
        const price = typeof it.price === "number" ? it.price : lookupPrice(it.name);
        const unit = typeof price === "number" ? `¥${price.toFixed(2)}` : "";
        return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;">
          <span style="flex:1;color:#1a1a1a;font-size:15px;">${escapeHtml(it.name)}</span>
          <span style="color:#666;font-size:13px;margin:0 14px;">x${it.qty}</span>
          <span style="color:#1a1a1a;font-size:14px;min-width:64px;text-align:right;">${unit}</span>
        </div>`;
      })
      .join("");
    detailHtml = `
        <div style="background:${bodyColor};border-radius:12px;padding:4px 16px;">${rows}</div>`;
  }
  return `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#999;font-size:13px;">订单类型</span>
        <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${typeText}</span>
      </div>
      ${detailHtml}`;
}

/** 订单元信息（编号/时间/取餐方式），颜色随主题强调色 */
function buildMetaHtml(order: Order, accent: string): string {
  const orderTime = order.createdAt
    ? order.createdAt
    : `${order.date}${order.time ? " " + order.time : ""}`;
  return `
        <p style="margin:0 0 10px;color:${accent};font-size:15px;font-weight:700;">订单信息</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#999;font-size:13px;">订单号</span>
          <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${escapeHtml(order.id)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#999;font-size:13px;">下单时间</span>
          <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${escapeHtml(orderTime)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:10px;margin-bottom:14px;border-bottom:1px dashed ${accent}66;">
          <span style="color:#999;font-size:13px;">取餐方式</span>
          <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${escapeHtml(order.pickup || "到店自取")}</span>
        </div>`;
}

function buildTotalHtml(order: Order, accent: string): string {
  return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:16px;border-top:1px dashed ${accent}33;">
          <span style="color:#666;font-size:14px;">合计金额</span>
          <span style="color:${accent};font-size:22px;font-weight:800;">¥${order.total.toFixed(2)}</span>
        </div>`;
}

/* ============== 主题配置 ============== */
export interface MailTheme {
  key: string;
  label: string;
  subjectPrefix: string;
  /** 外套背景 */
  outerBg: string;
  /** 主卡片背景 */
  cardBg: string;
  /** 头部 Hero 渐变 */
  heroGradient: string;
  /** 强调色（状态/合计/分隔线） */
  accent: string;
  /** 主文字色 */
  textColor: string;
  /** 柔和文字色（题首/金句/底部签名） */
  softColor: string;
  /** 题首小字，如 "✦ 七夕·特供 ✦"；不传则不显示 */
  topKicker?: string;
  /** 顶部徽章，如 "七夕·鹊桥相会" */
  badge: string;
  /** 主标题下方小字，如 "· 浪漫专送 ·" */
  titleSub: string;
  /** Hero 引言，如 "愿这一餐，与心上人共赴" */
  intro: string;
  /** Hero 内顶部装饰（SVG img 标签或空），默认空 */
  heroDecor?: string;
  /** 内容区与头部之间的横幅 SVG（img 标签），默认空 */
  banner?: string;
  /** 底部签名区诗句 */
  signVerse: string;
  /** 印章 SVG（img 标签），默认空 */
  seal?: string;
  /** 底部金句 */
  bottomVerse: string;
  /** 星点收尾 SVG（img 标签），默认空 */
  galaxy?: string;
  /** 明细表头/卡片配色（传给 buildDetailHtml） */
  detailHeader: string;
  detailBody: string;
  /** 底部签名区背景（默认同 cardBg 渐变） */
  signBg?: string;
}

/* ============== 公共渲染骨架 ============== */
function buildMailWithTheme(order: Order, theme: MailTheme): string {
  const { accent } = theme;
  return `
  <div style="background:${theme.outerBg};padding:40px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:${theme.textColor};">
    <div style="max-width:480px;margin:0 auto;">

      ${theme.topKicker ? `<p style="text-align:center;margin:0 0 14px;color:${theme.softColor};font-size:11px;letter-spacing:6px;opacity:0.85;">${theme.topKicker}</p>` : ""}

      <div style="background:${theme.cardBg};border-radius:24px;overflow:hidden;box-shadow:0 18px 44px ${accent}2e,0 3px 10px ${accent}14;">

        <!-- Hero 头部 -->
        <div style="background:${theme.heroGradient};padding:30px 24px 32px;text-align:center;color:#fff;">
          ${theme.heroDecor ? `<div style="text-align:center;margin:0 0 8px;">${theme.heroDecor}</div>` : ""}
          <div style="display:inline-block;background:rgba(255,255,255,0.16);padding:6px 18px;border-radius:99px;font-size:11px;letter-spacing:4px;color:#fff;margin:0 0 14px;">${theme.badge}</div>
          <h1 style="margin:6px 0 0;font-size:30px;font-weight:800;letter-spacing:2px;line-height:1.3;color:#fff;">陈氏川菜小炒</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.82);font-size:12px;letter-spacing:6px;">${theme.titleSub}</p>
          <div style="margin:18px auto 14px;width:120px;text-align:center;">
            <span style="display:inline-block;width:32px;height:1px;background:rgba(255,255,255,0.5);vertical-align:middle;"></span>
            <span style="display:inline-block;margin:0 10px;color:rgba(255,255,255,0.9);font-size:14px;vertical-align:middle;">♡</span>
            <span style="display:inline-block;width:32px;height:1px;background:rgba(255,255,255,0.5);vertical-align:middle;"></span>
          </div>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.95);letter-spacing:1px;">${theme.intro}</p>
        </div>

        ${theme.banner ? `<div style="text-align:center;background:${theme.cardBg};padding:6px 0 2px;"><img src="${theme.banner}" width="100%" alt="" style="display:block;border:0;max-width:480px;margin:0 auto;" /></div>` : ""}

        <!-- 内容区 -->
        <div style="padding:4px 24px 6px;">
          ${buildMetaHtml(order, accent)}
          <div style="padding:14px 0 0;">
            ${buildDetailHtml(order, theme.detailHeader, theme.detailBody)}
          </div>
          <div style="padding:18px 0 24px;">
            ${buildTotalHtml(order, accent)}
          </div>
        </div>

        <!-- 底部签名区 -->
        <div style="background:${theme.signBg || theme.cardBg};border-top:1px dashed ${accent}40;padding:24px 24px 26px;text-align:center;">
          <p style="margin:0 0 16px;color:${theme.softColor};font-size:14px;letter-spacing:3px;">${theme.signVerse}</p>
          ${theme.seal ? `<div style="margin:0 0 14px;"><img src="${theme.seal}" width="84" alt="" style="display:inline-block;border:0;" /></div>` : ""}
          <p style="margin:16px 0 0;color:${theme.softColor};font-size:11px;letter-spacing:1.5px;opacity:0.85;">💗 ${theme.bottomVerse} 💗</p>
        </div>

      </div>

      <p style="text-align:center;margin:18px 0 8px;color:${theme.softColor};font-size:11px;letter-spacing:3px;opacity:0.55;">${theme.bottomVerse}</p>
      ${theme.galaxy ? `<div style="text-align:center;"><img src="${theme.galaxy}" width="100%" alt="" style="display:block;border:0;max-width:480px;margin:0 auto;opacity:0.7;" /></div>` : ""}

    </div>
  </div>`;
}

/* ============== 各主题 SVG 装饰 ============== */
// —— 七夕 ——
const moonSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='46' height='46' viewBox='0 0 46 46'><path d='M30 5 a17 17 0 1 0 0 36 a13 13 0 1 1 0 -36 Z' fill='#fff7e6'/></svg>`;
const starSvgQ = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'><path d='M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z' fill='#ffffff'/></svg>`;
const qixiBridgeSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='64' viewBox='0 0 480 64'><path d='M60 56 Q240 8 420 56' fill='none' stroke='#e9b7c8' stroke-width='2.5'/><path d='M72 50 Q240 16 408 50' fill='none' stroke='#f0cdd8' stroke-width='1.5' stroke-dasharray='3 4'/><path d='M150 26 Q158 18 166 26 M166 26 Q174 18 182 26' stroke='#b8536f' stroke-width='2.2' fill='none' stroke-linecap='round'/><path d='M300 20 Q308 12 316 20 M316 20 Q324 12 332 20' stroke='#b8536f' stroke-width='2.2' fill='none' stroke-linecap='round'/><circle cx='110' cy='16' r='1.6' fill='#d4a574'/><circle cx='240' cy='10' r='1.6' fill='#d4a574'/><circle cx='372' cy='18' r='1.6' fill='#d4a574'/></svg>`;
const qixiSealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#b8536f' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#b8536f' stroke-width='1.4' opacity='0.55'/><text x='46' y='43' font-size='21' fill='#b8536f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold'>陈氏</text><text x='46' y='71' font-size='21' fill='#b8536f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold'>川菜</text></svg>`;
const qixiGalaxySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='22' viewBox='0 0 480 22'><circle cx='170' cy='11' r='1.4' fill='#d4a574'/><circle cx='210' cy='7' r='1.2' fill='#b8536f'/><circle cx='240' cy='12' r='1.7' fill='#d4a574'/><circle cx='270' cy='8' r='1.2' fill='#b8536f'/><circle cx='310' cy='11' r='1.4' fill='#d4a574'/></svg>`;

const qixiTheme: MailTheme = {
  key: "qixi",
  label: "七夕",
  subjectPrefix: "【陈氏川菜小炒·七夕】一份浪漫新订单",
  outerBg: "linear-gradient(180deg,#fef5f7 0%,#fbe6ec 100%)",
  cardBg: "#fffafd",
  heroGradient: "linear-gradient(135deg,#b8536f 0%,#d4517a 45%,#e8849f 100%)",
  accent: "#b8536f",
  textColor: "#3a1c25",
  softColor: "#b8536f",
  topKicker: "✦ &nbsp; 七 夕 · 特 供 &nbsp; ✦",
  badge: "七 夕 · 鹊 桥 相 会",
  titleSub: "· 浪 漫 专 送 ·",
  intro: "愿这一餐，与心上人共赴",
  heroDecor: `<img src="${svgUri(starSvgQ)}" width="12" alt="" style="display:inline-block;vertical-align:middle;margin:0 8px;opacity:0.75;border:0;" /><img src="${svgUri(moonSvg)}" width="42" alt="弯月" style="display:inline-block;vertical-align:middle;border:0;" />`,
  banner: svgUri(qixiBridgeSvg),
  signVerse: "❀ &nbsp; 双 宿 双 飞 · 共 此 良 辰 &nbsp; ❀",
  seal: svgUri(qixiSealSvg),
  bottomVerse: "七夕快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(qixiGalaxySvg),
  detailHeader: "rgba(184,83,111,0.08)",
  detailBody: "rgba(184,83,111,0.08)",
  signBg: "linear-gradient(180deg,#fffafd 0%,#fceff2 100%)",
};

// —— 教师节 ——
const bookSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='46' height='36' viewBox='0 0 46 36'><path d='M23 8 C16 4 8 4 3 7 L3 30 C8 27 16 27 23 31 Z' fill='#ffffff' opacity='0.95'/><path d='M23 8 C30 4 38 4 43 7 L43 30 C38 27 30 27 23 31 Z' fill='#ffffff' opacity='0.8'/><path d='M23 8 L23 31' stroke='#2f6b4f' stroke-width='1.5'/></svg>`;
const flowerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><circle cx='15' cy='7' r='5' fill='#f5dca8'/><circle cx='23' cy='12' r='5' fill='#f5dca8'/><circle cx='20' cy='22' r='5' fill='#f5dca8'/><circle cx='10' cy='22' r='5' fill='#f5dca8'/><circle cx='7' cy='12' r='5' fill='#f5dca8'/><circle cx='15' cy='15' r='4' fill='#c9a24b'/></svg>`;
const teacherBannerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='64' viewBox='0 0 480 64'><g transform='translate(118,16) scale(0.95)'><circle cx='15' cy='7' r='5' fill='#f5dca8'/><circle cx='23' cy='12' r='5' fill='#f5dca8'/><circle cx='20' cy='22' r='5' fill='#f5dca8'/><circle cx='10' cy='22' r='5' fill='#f5dca8'/><circle cx='7' cy='12' r='5' fill='#f5dca8'/><circle cx='15' cy='15' r='4' fill='#c9a24b'/></g><g transform='translate(332,16) scale(0.95)'><circle cx='15' cy='7' r='5' fill='#f5dca8'/><circle cx='23' cy='12' r='5' fill='#f5dca8'/><circle cx='20' cy='22' r='5' fill='#f5dca8'/><circle cx='10' cy='22' r='5' fill='#f5dca8'/><circle cx='7' cy='12' r='5' fill='#f5dca8'/><circle cx='15' cy='15' r='4' fill='#c9a24b'/></g><path d='M240 22 C228 16 214 16 204 20 L204 46 C214 42 228 42 240 48 Z' fill='#ffffff' opacity='0.95'/><path d='M240 22 C252 16 266 16 276 20 L276 46 C266 42 252 42 240 48 Z' fill='#ffffff' opacity='0.8'/><path d='M240 22 L240 48' stroke='#2f6b4f' stroke-width='1.5'/><circle cx='180' cy='12' r='1.6' fill='#c9a24b'/><circle cx='300' cy='12' r='1.6' fill='#c9a24b'/></svg>`;
const teacherSealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#2f6b4f' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#2f6b4f' stroke-width='1.4' opacity='0.55'/><text x='46' y='45' font-size='20' fill='#2f6b4f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='2'>谢师宴</text><text x='46' y='72' font-size='12' fill='#2f6b4f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>陈氏川菜</text></svg>`;
const teacherGalaxySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='22' viewBox='0 0 480 22'><circle cx='170' cy='11' r='1.4' fill='#c9a24b'/><circle cx='210' cy='7' r='1.2' fill='#d4a574'/><circle cx='240' cy='12' r='1.7' fill='#c9a24b'/><circle cx='270' cy='8' r='1.2' fill='#d4a574'/><circle cx='310' cy='11' r='1.4' fill='#c9a24b'/></svg>`;

const teacherTheme: MailTheme = {
  key: "teacher",
  label: "教师节",
  subjectPrefix: "【陈氏川菜小炒·教师节】一份谢师新订单",
  outerBg: "linear-gradient(180deg,#f4f1e6 0%,#eef3ec 100%)",
  cardBg: "#faf8f2",
  heroGradient: "linear-gradient(135deg,#234f3a 0%,#2f6b4f 45%,#3f7d5c 100%)",
  accent: "#2f6b4f",
  textColor: "#2a3a30",
  softColor: "#2f6b4f",
  topKicker: "✦ &nbsp; 教 师 节 · 谢 师 宴 &nbsp; ✦",
  badge: "教 师 节 · 感 念 师 恩",
  titleSub: "· 谢 师 专 享 ·",
  intro: "一桌好菜，谢三尺讲台恩",
  heroDecor: `<img src="${svgUri(bookSvg)}" width="40" alt="书本" style="display:inline-block;vertical-align:middle;margin:0 8px;border:0;" /><img src="${svgUri(flowerSvg)}" width="28" alt="康乃馨" style="display:inline-block;vertical-align:middle;margin:0 4px;border:0;" /><img src="${svgUri(flowerSvg)}" width="20" alt="康乃馨" style="display:inline-block;vertical-align:middle;margin:0 2px;opacity:0.85;border:0;" />`,
  banner: svgUri(teacherBannerSvg),
  signVerse: "❀ &nbsp; 桃 李 满 天 下 · 师 恩 永 难 忘 &nbsp; ❀",
  seal: svgUri(teacherSealSvg),
  bottomVerse: "教师节快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(teacherGalaxySvg),
  detailHeader: "rgba(47,107,79,0.08)",
  detailBody: "rgba(47,107,79,0.08)",
  signBg: "linear-gradient(180deg,#faf8f2 0%,#eef3ec 100%)",
};

// —— 中秋 ——
const midMoonSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><circle cx='22' cy='22' r='18' fill='#f3c969'/><circle cx='16' cy='17' r='3' fill='#e8b84b' opacity='0.6'/><circle cx='27' cy='26' r='4' fill='#e8b84b' opacity='0.5'/><circle cx='26' cy='14' r='2' fill='#e8b84b' opacity='0.5'/></svg>`;
const midRabbitSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='40' viewBox='0 0 34 40'><ellipse cx='17' cy='28' rx='12' ry='10' fill='#ffffff'/><ellipse cx='17' cy='14' rx='9' ry='10' fill='#ffffff'/><ellipse cx='11' cy='6' rx='3' ry='7' fill='#ffffff'/><ellipse cx='21' cy='6' rx='3' ry='7' fill='#ffffff'/><circle cx='14' cy='13' r='1.6' fill='#2c4a6e'/><circle cx='20' cy='13' r='1.6' fill='#2c4a6e'/><circle cx='17' cy='17' r='1.8' fill='#f3a9b0'/></svg>`;
const midMooncakeSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'><circle cx='13' cy='13' r='11' fill='#e0a85a'/><circle cx='13' cy='13' r='11' fill='none' stroke='#c8902f' stroke-width='1.6'/><path d='M13 4 L13 22 M4 13 L22 13 M6 6 L20 20 M20 6 L6 20' stroke='#c8902f' stroke-width='1' opacity='0.6'/></svg>`;
const midBannerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='64' viewBox='0 0 480 64'><g transform='translate(78,18)'>${midMooncakeSvg}</g><path d='M60 42 q12 -16 30 -9 q7 -14 26 -7 q16 -2 16 12 q14 2 9 14 q-46 5 -81 -10 Z' fill='#dbe4f0' opacity='0.9'/><circle cx='240' cy='32' r='19' fill='#f3c969'/><circle cx='232' cy='26' r='3' fill='#e8b84b' opacity='0.6'/><circle cx='248' cy='38' r='3.5' fill='#e8b84b' opacity='0.5'/><path d='M420 42 q-12 -16 -30 -9 q-7 -14 -26 -7 q-16 -2 -16 12 q-14 2 -9 14 q46 5 81 -10 Z' fill='#dbe4f0' opacity='0.9'/><g transform='translate(376,18)'>${midMooncakeSvg}</g><circle cx='160' cy='14' r='1.6' fill='#c8902f'/><circle cx='320' cy='12' r='1.6' fill='#c8902f'/></svg>`;
const midSealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#c8902f' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#c8902f' stroke-width='1.4' opacity='0.55'/><text x='46' y='44' font-size='17' fill='#c8902f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>中秋团圆</text><text x='46' y='72' font-size='12' fill='#c8902f' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>陈氏川菜</text></svg>`;
const midGalaxySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='22' viewBox='0 0 480 22'><circle cx='170' cy='11' r='1.4' fill='#c8902f'/><circle cx='210' cy='7' r='1.2' fill='#f3c969'/><circle cx='240' cy='12' r='1.7' fill='#c8902f'/><circle cx='270' cy='8' r='1.2' fill='#f3c969'/><circle cx='310' cy='11' r='1.4' fill='#c8902f'/></svg>`;

const midautumnTheme: MailTheme = {
  key: "midautumn",
  label: "中秋节",
  subjectPrefix: "【陈氏川菜小炒·中秋】一份团圆新订单",
  outerBg: "linear-gradient(180deg,#e9eef5 0%,#dde6f0 100%)",
  cardBg: "#fbf6ec",
  heroGradient: "linear-gradient(135deg,#1f3a5f 0%,#2c4a6e 45%,#3a5a82 100%)",
  accent: "#c8902f",
  textColor: "#2a3142",
  softColor: "#c8902f",
  topKicker: "✦ &nbsp; 中 秋 · 团 圆 宴 &nbsp; ✦",
  badge: "中 秋 · 月 圆 人 圆",
  titleSub: "· 团 圆 专 享 ·",
  intro: "一轮明月，寄一桌团圆饭",
  heroDecor: `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin:0 0 6px;"><img src="${svgUri(midRabbitSvg)}" width="30" alt="玉兔" style="display:inline-block;vertical-align:middle;margin:0 6px;border:0;" /><img src="${svgUri(midMoonSvg)}" width="40" alt="圆月" style="display:inline-block;vertical-align:middle;border:0;" /></div>`,
  banner: svgUri(midBannerSvg),
  signVerse: "❀ &nbsp; 月 圆 人 圆 · 事 事 圆 满 &nbsp; ❀",
  seal: svgUri(midSealSvg),
  bottomVerse: "中秋快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(midGalaxySvg),
  detailHeader: "rgba(200,144,47,0.08)",
  detailBody: "rgba(200,144,47,0.08)",
  signBg: "linear-gradient(180deg,#fbf6ec 0%,#eef2f7 100%)",
};

// —— 国庆 ——
const natStarSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 32 32'><path d='M16 2 L19.5 11.5 L30 12 L22 18.5 L25 29 L16 23 L7 29 L10 18.5 L2 12 L12.5 11.5 Z' fill='#f5c518'/></svg>`;
const natFlagSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 28 32'><rect x='4' y='2' width='2' height='28' fill='#f5c518'/><path d='M6 3 L26 5 L24 19 L6 17 Z' fill='#c8102e'/><path d='M11 4 L13 8 L18 8.3 L14 11 L15.3 15.5 L11 12.8 L6.7 15.5 L8 11 L4 8.3 L9 8 Z' fill='#f5c518'/></svg>`;
const natBannerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='64' viewBox='0 0 480 64'><line x1='84' y1='2' x2='84' y2='14' stroke='#8a0f24' stroke-width='1.5'/><rect x='74' y='13' width='20' height='4' rx='1' fill='#f5c518'/><ellipse cx='84' cy='32' rx='14' ry='17' fill='#c8102e'/><ellipse cx='84' cy='32' rx='14' ry='17' fill='none' stroke='#f5c518' stroke-width='1' opacity='0.6'/><rect x='74' y='47' width='20' height='4' rx='1' fill='#f5c518'/><line x1='84' y1='51' x2='84' y2='60' stroke='#f5c518' stroke-width='1.5'/><line x1='396' y1='2' x2='396' y2='14' stroke='#8a0f24' stroke-width='1.5'/><rect x='386' y='13' width='20' height='4' rx='1' fill='#f5c518'/><ellipse cx='396' cy='32' rx='14' ry='17' fill='#c8102e'/><ellipse cx='396' cy='32' rx='14' ry='17' fill='none' stroke='#f5c518' stroke-width='1' opacity='0.6'/><rect x='386' y='47' width='20' height='4' rx='1' fill='#f5c518'/><line x1='396' y1='51' x2='396' y2='60' stroke='#f5c518' stroke-width='1.5'/><g transform='translate(228,20) scale(0.75)'><path d='M16 2 L19.5 11.5 L30 12 L22 18.5 L25 29 L16 23 L7 29 L10 18.5 L2 12 L12.5 11.5 Z' fill='#f5c518'/></g><circle cx='150' cy='12' r='1.6' fill='#f5c518'/><circle cx='330' cy='12' r='1.6' fill='#f5c518'/></svg>`;
const natSealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#c8102e' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#c8102e' stroke-width='1.4' opacity='0.55'/><text x='46' y='45' font-size='16' fill='#c8102e' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='2'>国庆欢庆</text><text x='46' y='72' font-size='12' fill='#c8102e' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>陈氏川菜</text></svg>`;
const natGalaxySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='22' viewBox='0 0 480 22'><circle cx='170' cy='11' r='1.4' fill='#f5c518'/><circle cx='210' cy='7' r='1.2' fill='#c8102e'/><circle cx='240' cy='12' r='1.7' fill='#f5c518'/><circle cx='270' cy='8' r='1.2' fill='#c8102e'/><circle cx='310' cy='11' r='1.4' fill='#f5c518'/></svg>`;

const nationaldayTheme: MailTheme = {
  key: "nationalday",
  label: "国庆",
  subjectPrefix: "【陈氏川菜小炒·国庆】一份贺庆新订单",
  outerBg: "linear-gradient(180deg,#fbe9e9 0%,#f6dcdc 100%)",
  cardBg: "#fff8f3",
  heroGradient: "linear-gradient(135deg,#c8102e 0%,#d4293f 45%,#e23a4e 100%)",
  accent: "#c8102e",
  textColor: "#3a1c20",
  softColor: "#c8102e",
  topKicker: "✦ &nbsp; 国 庆 · 盛 世 华 诞 &nbsp; ✦",
  badge: "国 庆 · 盛 世 华 诞",
  titleSub: "· 贺 庆 专 享 ·",
  intro: "山河远阔，共一桌家国庆",
  heroDecor: `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin:0 0 6px;"><img src="${svgUri(natFlagSvg)}" width="24" alt="红旗" style="display:inline-block;vertical-align:middle;border:0;" /><img src="${svgUri(natStarSvg)}" width="28" alt="五角星" style="display:inline-block;vertical-align:middle;border:0;" /></div>`,
  banner: svgUri(natBannerSvg),
  signVerse: "❀ &nbsp; 国 泰 民 安 · 盛 世 同 庆 &nbsp; ❀",
  seal: svgUri(natSealSvg),
  bottomVerse: "国庆快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(natGalaxySvg),
  detailHeader: "rgba(200,16,46,0.08)",
  detailBody: "rgba(200,16,46,0.08)",
  signBg: "linear-gradient(180deg,#fff8f3 0%,#fbe9e9 100%)",
};

// —— 元旦（蓝紫跨年风）——
const nyFireworkSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'><g stroke='#f5c518' stroke-width='1.6' stroke-linecap='round'><line x1='17' y1='2' x2='17' y2='9'/><line x1='17' y1='25' x2='17' y2='32'/><line x1='2' y1='17' x2='9' y2='17'/><line x1='25' y1='17' x2='32' y2='17'/><line x1='6' y1='6' x2='11' y2='11'/><line x1='23' y1='23' x2='28' y2='28'/><line x1='28' y1='6' x2='23' y2='11'/><line x1='11' y1='23' x2='6' y2='28'/></g><circle cx='17' cy='17' r='3' fill='#f5c518'/><circle cx='17' cy='4' r='1.4' fill='#f5c518'/><circle cx='17' cy='30' r='1.4' fill='#f5c518'/><circle cx='4' cy='17' r='1.4' fill='#f5c518'/><circle cx='30' cy='17' r='1.4' fill='#f5c518'/></svg>`;
const nyClockSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><circle cx='15' cy='15' r='13' fill='none' stroke='#f5c518' stroke-width='2'/><circle cx='15' cy='15' r='13' fill='none' stroke='#cdd6e8' stroke-width='0.6' opacity='0.6'/><line x1='15' y1='15' x2='15' y2='6' stroke='#f5c518' stroke-width='2' stroke-linecap='round'/><line x1='15' y1='15' x2='15' y2='11' stroke='#f5c518' stroke-width='2' stroke-linecap='round'/><circle cx='15' cy='15' r='1.6' fill='#f5c518'/></svg>`;
const nyBannerSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='64' viewBox='0 0 480 64'><g transform='translate(70,32)'><g stroke='#f5c518' stroke-width='1.6' stroke-linecap='round'><line x1='0' y1='-18' x2='0' y2='-9'/><line x1='0' y1='18' x2='0' y2='9'/><line x1='-18' y1='0' x2='-9' y2='0'/><line x1='18' y1='0' x2='9' y2='0'/><line x1='-13' y1='-13' x2='-6' y2='-6'/><line x1='13' y1='13' x2='6' y2='6'/><line x1='13' y1='-13' x2='6' y2='-6'/><line x1='-13' y1='13' x2='-6' y2='6'/></g><circle cx='0' cy='0' r='2.5' fill='#f5c518'/></g><g transform='translate(410,32)'><g stroke='#f5c518' stroke-width='1.6' stroke-linecap='round'><line x1='0' y1='-18' x2='0' y2='-9'/><line x1='0' y1='18' x2='0' y2='9'/><line x1='-18' y1='0' x2='-9' y2='0'/><line x1='18' y1='0' x2='9' y2='0'/><line x1='-13' y1='-13' x2='-6' y2='-6'/><line x1='13' y1='13' x2='6' y2='6'/><line x1='13' y1='-13' x2='6' y2='-6'/><line x1='-13' y1='13' x2='-6' y2='6'/></g><circle cx='0' cy='0' r='2.5' fill='#f5c518'/></g><text x='240' y='42' font-size='30' fill='#f5c518' text-anchor='middle' font-family='Georgia,serif' font-weight='bold' letter-spacing='2'>2027</text><circle cx='170' cy='14' r='1.8' fill='#cdd6e8'/><circle cx='310' cy='12' r='1.8' fill='#cdd6e8'/><circle cx='200' cy='20' r='1.2' fill='#f5c518'/><circle cx='280' cy='18' r='1.2' fill='#f5c518'/></svg>`;
const nySealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#3b3f9c' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#3b3f9c' stroke-width='1.4' opacity='0.55'/><text x='46' y='45' font-size='16' fill='#3b3f9c' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='2'>元旦新禧</text><text x='46' y='72' font-size='12' fill='#3b3f9c' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>陈氏川菜</text></svg>`;
const nyGalaxySvg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='22' viewBox='0 0 480 22'><circle cx='170' cy='11' r='1.4' fill='#cdd6e8'/><circle cx='210' cy='7' r='1.2' fill='#f5c518'/><circle cx='240' cy='12' r='1.7' fill='#cdd6e8'/><circle cx='270' cy='8' r='1.2' fill='#f5c518'/><circle cx='310' cy='11' r='1.4' fill='#cdd6e8'/></svg>`;

const newyearTheme: MailTheme = {
  key: "newyear",
  label: "元旦",
  subjectPrefix: "【陈氏川菜小炒·元旦】一份迎新新订单",
  outerBg: "linear-gradient(180deg,#e7e9f5 0%,#dde0f0 100%)",
  cardBg: "#f7f6fc",
  heroGradient: "linear-gradient(135deg,#2b2d6e 0%,#3f3f8f 45%,#5a55b0 100%)",
  accent: "#3b3f9c",
  textColor: "#2a2c44",
  softColor: "#3b3f9c",
  topKicker: "✦ &nbsp; 元 旦 · 新 年 新 始 &nbsp; ✦",
  badge: "元 旦 · 岁 启 新 元",
  titleSub: "· 迎 新 专 享 ·",
  intro: "一元复始，共一桌新年饭",
  heroDecor: `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin:0 0 6px;"><img src="${svgUri(nyFireworkSvg)}" width="30" alt="烟花" style="display:inline-block;vertical-align:middle;border:0;" /><img src="${svgUri(nyClockSvg)}" width="26" alt="跨年时钟" style="display:inline-block;vertical-align:middle;border:0;" /></div>`,
  banner: svgUri(nyBannerSvg),
  signVerse: "❀ &nbsp; 辞 旧 迎 新 · 岁 岁 安 康 &nbsp; ❀",
  seal: svgUri(nySealSvg),
  bottomVerse: "元旦快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(nyGalaxySvg),
  detailHeader: "rgba(59,63,156,0.08)",
  detailBody: "rgba(59,63,156,0.08)",
  signBg: "linear-gradient(180deg,#f7f6fc 0%,#e7e9f5 100%)",
};

// —— 除夕（复用元旦跨年 SVG，文案改为守岁迎新）——
const nyeSealSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='92' height='92' viewBox='0 0 92 92'><rect x='4' y='4' width='84' height='84' rx='14' fill='none' stroke='#c8102e' stroke-width='3'/><rect x='12' y='12' width='68' height='68' rx='9' fill='none' stroke='#c8102e' stroke-width='1.4' opacity='0.55'/><text x='46' y='45' font-size='16' fill='#c8102e' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='2'>除夕守岁</text><text x='46' y='72' font-size='12' fill='#c8102e' text-anchor='middle' font-family='STKaiti,KaiTi,serif' font-weight='bold' letter-spacing='1'>陈氏川菜</text></svg>`;

const newyearEveTheme: MailTheme = {
  key: "newyear_eve",
  label: "除夕",
  subjectPrefix: "【陈氏川菜小炒·除夕】一份守岁新订单",
  outerBg: "linear-gradient(180deg,#fbe9e9 0%,#f6dcdc 100%)",
  cardBg: "#fff8f3",
  heroGradient: "linear-gradient(135deg,#c8102e 0%,#d4293f 45%,#e23a4e 100%)",
  accent: "#c8102e",
  textColor: "#3a1c20",
  softColor: "#c8102e",
  topKicker: "✦ &nbsp; 除 夕 · 守 岁 迎 新 &nbsp; ✦",
  badge: "除 夕 · 阖 家 团 圆",
  titleSub: "· 守 岁 专 享 ·",
  intro: "辞旧岁，共一桌团圆饭",
  heroDecor: `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin:0 0 6px;"><img src="${svgUri(nyFireworkSvg)}" width="30" alt="烟花" style="display:inline-block;vertical-align:middle;border:0;" /><img src="${svgUri(nyClockSvg)}" width="26" alt="跨年时钟" style="display:inline-block;vertical-align:middle;border:0;" /></div>`,
  banner: svgUri(nyBannerSvg),
  signVerse: "❀ &nbsp; 辞 旧 迎 新 · 岁 岁 安 康 &nbsp; ❀",
  seal: svgUri(nyeSealSvg),
  bottomVerse: "除夕快乐 · 本邮件由点菜小程序自动发送",
  galaxy: svgUri(nyGalaxySvg),
  detailHeader: "rgba(200,16,46,0.08)",
  detailBody: "rgba(200,16,46,0.08)",
  signBg: "linear-gradient(180deg,#fff8f3 0%,#fbe9e9 100%)",
};

// —— 默认（橙色暖调）——
const defaultTheme: MailTheme = {
  key: "default",
  label: "默认",
  subjectPrefix: "【陈氏川菜小炒】您有一个新订单",
  outerBg: "#f5f0e6",
  cardBg: "#fffcf5",
  heroGradient: "linear-gradient(135deg,#f5a623,#ff8c1a)",
  accent: "#f5a623",
  textColor: "#1a1a1a",
  softColor: "#bbb",
  badge: "您 有 一 份 新 订 单",
  titleSub: "· 温 馨 专 享 ·",
  intro: "感谢您的惠顾，马上为您备餐",
  detailHeader: "rgb(255, 241, 214)",
  detailBody: "rgb(255, 248, 234)",
  signVerse: "❀ &nbsp; 感 谢 惠 顾 · 期 待 再 相 逢 &nbsp; ❀",
  bottomVerse: "本邮件由点菜小程序自动发送",
};

/* ============== 模板导出 ============== */
export interface MailTemplate {
  key: string;
  label: string;
  subjectPrefix: string;
  buildHtml: (order: Order) => string;
}

function toTemplate(theme: MailTheme): MailTemplate {
  return {
    key: theme.key,
    label: theme.label,
    subjectPrefix: theme.subjectPrefix,
    buildHtml: (order) => buildMailWithTheme(order, theme),
  };
}

export const mailThemes: MailTheme[] = [defaultTheme, qixiTheme, teacherTheme, midautumnTheme, nationaldayTheme, newyearTheme, newyearEveTheme];
export const mailTemplates: MailTemplate[] = mailThemes.map(toTemplate);

export function getMailTemplate(key: string): MailTemplate {
  return mailTemplates.find((t) => t.key === key) || mailTemplates[0];
}

/** 公历教师节：9 月 10 日 */
function isTeacherDay(date: Date): boolean {
  return date.getMonth() === 8 && date.getDate() === 10;
}
/** 公历国庆：10 月 1 日 */
function isNationalDay(date: Date): boolean {
  return date.getMonth() === 9 && date.getDate() === 1;
}
/** 公历元旦：1 月 1 日 */
function isNewYearDay(date: Date): boolean {
  return date.getMonth() === 0 && date.getDate() === 1;
}
/** 按订单日期匹配适用的节日模板（默认回退 default） */
function matchFestivalTemplate(date: Date): MailTemplate {
  if (isQixi(date)) return getMailTemplate("qixi");
  if (isTeacherDay(date)) return getMailTemplate("teacher");
  if (isMidAutumn(date)) return getMailTemplate("midautumn");
  if (isNationalDay(date)) return getMailTemplate("nationalday");
  if (isNewYearDay(date)) return getMailTemplate("newyear");
  if (isNewYearEve(date)) return getMailTemplate("newyear_eve");
  return getMailTemplate("default");
}

/** 根据订单生成日期自动选择模板 */
export function selectMailTemplate(order: Order): MailTemplate {
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  return matchFestivalTemplate(orderDate);
}
