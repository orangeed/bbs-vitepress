import { reactive, computed } from "vue";
import type { Dish, CartItem, Order, PreOrderDay } from "./types";
import { weekDays } from "./data";
import { getMailTemplate, selectMailTemplate } from "./mailTemplates";

/* ============== 直接点菜（购物车 / 订单） ============== */
const ORDERS_KEY = "chen-chuan-cai-orders";

// SSR 安全：VitePress 在构建/首屏会做 SSR，localStorage 不存在，需守卫
const isBrowser = typeof window !== "undefined";

function loadOrders(): Order[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* 忽略存储异常 */
  }
}

/* ============== 预点菜（按周存储） ============== */
function getWeekKey(d = new Date()): string {
  // 以“该周周一”的年月日作为周标识，例如 2026-W34-0817
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0=周日..6=周六
  const offsetToMonday =
    day >= 1 && day <= 5 ? 1 - day : day === 0 ? 1 : 8 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + offsetToMonday);
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  return `2026-W${getISOWeek(d)}-${pad(monday.getMonth() + 1)}${pad(monday.getDate())}`;
}

function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return week;
}

function getPreorderKey(weekKey: string) {
  return `chen-chuan-preorder-${weekKey}`;
}

/* ============== 下单后发送邮件（调用后端 /mail/send） ============== */
const ORDER_EMAIL = "1208917130@qq.com";

async function sendOrderEmail(order: Order, templateKey?: string) {
  if (!isBrowser) return;
  const template = templateKey
    ? getMailTemplate(templateKey)
    : selectMailTemplate(order);
  const subject = `${template.subjectPrefix} ${order.id}`;
  const html = template.buildHtml(order);
  try {
    await fetch("https://api.orangecj.cn/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: ORDER_EMAIL,
        subject,
        html,
      }),
    });
  } catch (e) {
    /* 邮件发送失败不影响下单结果，仅静默忽略 */
    console.error("发送订单邮件失败", e);
  }
}

function loadPreorderForCurrentWeek(): Record<string, string[]> {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(getPreorderKey(getWeekKey()));
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export const store = reactive({
  currentPage: "home" as string,
  selectedDishId: "",
  selectedPreOrderDayIndex: 0,
  // 当前编辑中的预点菜（按天存菜品 id 数组），仅针对当前周
  preOrderSelections: (isBrowser ? loadPreorderForCurrentWeek() : {}) as Record<
    string,
    string[]
  >,
  cart: {} as Record<string, number>,
  orders: (isBrowser ? loadOrders() : []) as Order[],
  showCheckout: false,
  showSuccess: false,
  showPreSuccess: false,
  selectedOrder: null as Order | null,
});

export function setPage(page: string) {
  store.currentPage = page;
}

export function goHome() {
  store.currentPage = "home";
}

export function goDishDetail(id: string) {
  store.selectedDishId = id;
  store.currentPage = "detail";
}

/* ============== 直接点菜 ============== */
export function addToCart(id: string, qty = 1) {
  store.cart[id] = (store.cart[id] ?? 0) + qty;
  if (store.cart[id] <= 0) delete store.cart[id];
}

export function removeFromCart(id: string) {
  if (store.cart[id]) {
    store.cart[id]--;
    if (store.cart[id] <= 0) delete store.cart[id];
  }
}

export function clearCart() {
  store.cart = {};
}

export function cartItems(dishList: Dish[]): CartItem[] {
  return Object.entries(store.cart)
    .map(([id, qty]) => {
      const dish = dishList.find((d) => d.id === id);
      return dish ? { dish, qty } : null;
    })
    .filter((x): x is CartItem => x !== null);
}

export function getCartSubtotal(dishList: Dish[]) {
  return cartItems(dishList).reduce(
    (sum, ci) => sum + ci.dish.price * ci.qty,
    0,
  );
}

export function openCheckout() {
  store.showCheckout = true;
}

export function closeCheckout() {
  store.showCheckout = false;
}

export function confirmOrder(dishList: Dish[]) {
  const items = cartItems(dishList);
  if (!items.length) return;
  const now = new Date();
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const order: Order = {
    id: "o" + now.getTime(),
    date: `${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    createdAt,
    items: items.map((ci) => ({ name: ci.dish.name, qty: ci.qty, price: ci.dish.price })),
    total: getCartSubtotal(dishList),
    status: "待确认",
    type: "direct",
    pickup: "到店自取",
  };
  store.orders.unshift(order);
  saveOrders(store.orders);
  clearCart();
  store.showCheckout = false;
  store.showSuccess = true;
  sendOrderEmail(order);
}

export function closeSuccess() {
  store.showSuccess = false;
  goHome();
}

export function removeOrder(id: string) {
  store.orders = store.orders.filter((o) => o.id !== id);
  saveOrders(store.orders);
}

/* ============== 预点菜 ============== */
// 当前编辑中的某天勾选（针对当前周）
export function togglePreDish(dayIndex: number, id: string) {
  if (!store.preOrderSelections[dayIndex])
    store.preOrderSelections[dayIndex] = [];
  const list = store.preOrderSelections[dayIndex];
  const i = list.indexOf(id);
  if (i > -1) list.splice(i, 1);
  else list.push(id);
}

export function isPreSelected(dayIndex: number, id: string) {
  return (store.preOrderSelections[dayIndex] || []).includes(id);
}

export function clearPreOrder() {
  store.preOrderSelections = {};
}

export function openOrderDetail(order: Order) {
  store.selectedOrder = order;
  store.currentPage = "order-detail";
}

export function closeOrderDetail() {
  store.selectedOrder = null;
  store.currentPage = "profile";
}

export function getPreDayDishes(dayIndex: number, dishList: Dish[]): string[] {
  const ids = store.preOrderSelections[dayIndex] || [];
  return ids
    .map((id) => dishList.find((d) => d.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function preorderWeekKey() {
  return getWeekKey();
}

// 确认预点菜：把当前周的预点菜落库为一条 type=preorder 订单，并持久化 selections
export function confirmPreOrder(dishList: Dish[]) {
  const week = getWeekKey();
  const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
  const now = new Date();
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  // 汇总当前周所有天的菜品
  let totalQty = 0;
  let totalPrice = 0;
  const items: { name: string; qty: number; price?: number }[] = [];
  Object.keys(store.preOrderSelections).forEach((dayIdx) => {
    const ids = store.preOrderSelections[dayIdx] || [];
    ids.forEach((id) => {
      const dish = dishList.find((d) => d.id === id);
      if (dish) {
        items.push({ name: dish.name, qty: 1, price: dish.price });
        totalQty++;
        totalPrice += dish.price;
      }
    });
  });
  if (!items.length) return;
  // 按周一到周五分组，构建 preDays（用于邮件及订单详情展示）
  const preDays: PreOrderDay[] = weekDays.map((wd, i) => {
    const ids = store.preOrderSelections[i] || [];
    const dishes = ids
      .map((id) => dishList.find((d) => d.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    return { day: wd.day, date: wd.date, dishes };
  });
  const order: Order = {
    id: "p" + now.getTime(),
    date: `本周(${pad(now.getMonth() + 1)}/${pad(now.getDate())}起)`,
    time: "",
    createdAt,
    items,
    total: totalPrice,
    status: "待确认",
    type: "preorder",
    preDays,
    pickup: "到店自取",
  };
  // 删除同一周旧的预点单，再插入新的（支持修改）
  store.orders = store.orders.filter(
    (o) => !(o.type === "preorder" && (o as any).weekKey === week),
  );
  (order as any).weekKey = week;
  store.orders.unshift(order);
  saveOrders(store.orders);
  sendOrderEmail(order);
  // 持久化当前周 selections，便于下次编辑时回显
  if (isBrowser) {
    try {
      window.localStorage.setItem(
        getPreorderKey(week),
        JSON.stringify(store.preOrderSelections),
      );
    } catch {
      /* 忽略 */
    }
  }
  store.showPreSuccess = true;
}

export function closePreSuccess() {
  store.showPreSuccess = false;
  goHome();
}

export const cartCount = computed(() =>
  Object.values(store.cart).reduce((a, b) => a + b, 0),
);
