import type { Order } from './types'

/* ============== 邮件格式模板 ==============
 * 每种场景对应一个模板：默认、七夕等。
 * 新增节日/场景时，在此文件追加一个模板并实现 buildHtml 即可。
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 预点菜按周一到周五分组展示 */
function buildPreDayBlocks(order: Order): string {
  const days = order.preDays && order.preDays.length ? order.preDays : []
  if (!days.length) {
    return `<p style="color:#99805a;font-size:14px;margin:4px 0 0;">（未安排任何菜品）</p>`
  }
  return days
    .map((d) => {
      const dishList =
        d.dishes && d.dishes.length
          ? d.dishes
              .map(
                (name, i) => `
                <div style="display:flex;align-items:center;padding:7px 12px;border-bottom:${i === d.dishes.length - 1 ? 'none' : '1px solid #f0e6d4'};">
                  <span style="flex:1;color:#1a1a1a;font-size:14px;font-weight:600;">${escapeHtml(name)}</span>
                  <span style="color:#666;font-size:13px;">x1</span>
                </div>`
              )
              .join('')
          : `<div style="padding:9px 12px;color:#b59b73;font-size:13px;">（未安排）</div>`
      return `
        <div style="background:#fff8ea;border-radius:12px;overflow:hidden;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:linear-gradient(135deg,#ffb347,#f5a623);">
            <span style="color:#fff;font-size:14px;font-weight:800;">${escapeHtml(d.day)}</span>
            <span style="color:rgba(255,255,255,0.95);font-size:12px;">${escapeHtml(d.date || '')}</span>
          </div>
          ${dishList}
        </div>`
    })
    .join('')
}

/** 根据订单类型生成菜品明细 HTML（默认布局，通用） */
export function buildOrderDetailHtml(order: Order): string {
  const typeText = order.type === 'preorder' ? '预点菜（本周）' : '直接点菜'

  let detailHtml: string
  if (order.type === 'preorder') {
    detailHtml = `
        <p style="color:#999;font-size:13px;margin:0 0 10px;">本周安排（周一到周五）</p>
        ${buildPreDayBlocks(order)}`
  } else {
    const rows = order.items
      .map(
        (it, i) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6d4;color:#888;font-size:14px;">${i + 1}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6d4;color:#1a1a1a;font-size:15px;font-weight:600;">${escapeHtml(it.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0e6d4;color:#666;font-size:14px;text-align:center;">x${it.qty}</td>
        </tr>`
      )
      .join('')
    detailHtml = `
        <table style="width:100%;border-collapse:collapse;background:#fff8ea;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#fff1d6;">
              <th style="padding:10px 12px;text-align:left;color:#c9760a;font-size:13px;">#</th>
              <th style="padding:10px 12px;text-align:left;color:#c9760a;font-size:13px;">菜品</th>
              <th style="padding:10px 12px;text-align:center;color:#c9760a;font-size:13px;">数量</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`
  }

  return `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="color:#999;font-size:13px;">订单类型</span>
        <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${typeText}</span>
      </div>
      ${detailHtml}`
}

/** 订单公共元信息（编号/时间/状态/合计） */
function buildMetaHtml(order: Order): string {
  return `
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#999;font-size:13px;">订单编号</span>
          <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${escapeHtml(order.id)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="color:#999;font-size:13px;">下单时间</span>
          <span style="color:#1a1a1a;font-size:13px;font-weight:600;">${escapeHtml(order.date)}${order.time ? ' ' + escapeHtml(order.time) : ''}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
          <span style="color:#999;font-size:13px;">订单状态</span>
          <span style="color:#f5a623;font-size:13px;font-weight:700;">${escapeHtml(order.status)}</span>
        </div>`
}

function buildTotalHtml(order: Order): string {
  return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:16px;border-top:1px dashed #e7d9bf;">
          <span style="color:#666;font-size:14px;">合计金额</span>
          <span style="color:#f5a623;font-size:22px;font-weight:800;">¥${order.total.toFixed(2)}</span>
        </div>`
}

export interface MailTemplate {
  key: string
  label: string
  /** 邮件主题（可不带订单号，发送时会拼接） */
  subjectPrefix: string
  /** 完整邮件 HTML */
  buildHtml: (order: Order) => string
}

/* ---------- 默认格式（原样式，橙色暖调） ---------- */
const defaultTemplate: MailTemplate = {
  key: 'default',
  label: '默认',
  subjectPrefix: '【陈氏川菜小炒】您有一个新订单',
  buildHtml: (order) => `
  <div style="background:#f5f0e6;padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fffcf5;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(245,166,35,0.15);">
      <div style="background:linear-gradient(135deg,#f5a623,#ff8c1a);padding:22px 24px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;">陈氏川菜小炒</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">您收到一份新订单</p>
      </div>
      <div style="padding:22px 24px;">
        ${buildMetaHtml(order)}
        ${buildOrderDetailHtml(order)}
        ${buildTotalHtml(order)}
      </div>
      <div style="padding:0 24px 22px;text-align:center;">
        <p style="margin:0;color:#bbb;font-size:12px;">本邮件由陈氏川菜小炒点菜小程序自动发送</p>
      </div>
    </div>
  </div>`,
}
  //  <div style="background:linear-gradient(160deg,#ffeef5 0%,#f3e8ff 100%);padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">

/* ---------- 七夕格式（粉紫浪漫调） ---------- */
const qixiTemplate: MailTemplate = {
  key: 'qixi',
  label: '七夕',
  subjectPrefix: '【陈氏川菜小炒·七夕】一份浪漫新订单',
  buildHtml: (order) => `
  <div style="background:这个点的菜是发送到了我的邮箱的呢;padding:24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fffafd;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(214,51,132,0.18);">
      <div style="background:linear-gradient(135deg,#ff6ea9,#c9468f);padding:24px 24px 22px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;letter-spacing:4px;color:rgba(255,255,255,0.85);">· 七 夕 ·</p>
        <h1 style="margin:0;color:#fff;font-size:21px;font-weight:800;">陈氏川菜小炒 · 浪漫专送</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.92);font-size:13px;">愿这一餐，与心上人共赴</p>
      </div>
      <div style="padding:22px 24px;">
        ${buildMetaHtml(order).replace(/#f5a623/g, '#e84b97')}
        ${buildOrderDetailHtml(order)}
        ${buildTotalHtml(order).replace(/#f5a623/g, '#e84b97')}
      </div>
      <div style="padding:0 24px 22px;text-align:center;">
        <p style="margin:0;color:#d98bb6;font-size:12px;">💗 七夕快乐，本邮件由点菜小程序自动发送 💗</p>
      </div>
    </div>
  </div>`,
}

export const mailTemplates: MailTemplate[] = [defaultTemplate, qixiTemplate]

export function getMailTemplate(key: string): MailTemplate {
  return mailTemplates.find((t) => t.key === key) || defaultTemplate
}

/** 根据当前日期自动选择模板（可在节日期间切换） */
export function selectMailTemplate(order: Order): MailTemplate {
  // 七夕：公历 8 月 19 日（可按实际节日调整）
  const now = new Date()
  const isQixi = now.getMonth() === 7 && now.getDate() === 19
  return isQixi ? qixiTemplate : getMailTemplate(order.type === 'preorder' ? 'default' : 'default')
}
