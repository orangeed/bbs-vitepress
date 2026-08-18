<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { store, goHome, setPage, preorderWeekKey, removeOrder } from './useStore'

const historyOrders = computed(() => store.orders.filter((o) => o.type === 'direct'))
const preOrders = computed(() => store.orders.filter((o) => o.type === 'preorder'))
const currentWeek = preorderWeekKey()

const DELETE_WIDTH = 72

// 历史订单卡片滑动状态：openId 表示当前已滑开露出删除按钮的卡片 id
const openId = ref('')

const drag = reactive({
  id: '',
  startX: 0,
  offset: 0,
  dragging: false,
  curOffset: 0,
  curId: '',
  moved: false,
})

function isCurrentWeek(order: any) {
  return order.weekKey === currentWeek
}

function editPreOrder() {
  setPage('preorder-date')
}

function statusClass(status: string) {
  if (status === '已完成') return 'status-done'
  if (status === '配送中') return 'status-deliver'
  return 'status-wait'
}

function onPointerDown(e: PointerEvent, id: string) {
  // 开始滑动另一张卡片时，先把其他已滑开的卡片收起
  if (openId.value && openId.value !== id) {
    openId.value = ''
  }
  drag.id = id
  drag.startX = e.clientX
  drag.offset = openId.value === id ? -DELETE_WIDTH : 0
  drag.dragging = true
  drag.moved = false
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!drag.dragging) return
  const dx = e.clientX - drag.startX
  if (Math.abs(dx) > 5) drag.moved = true
  let next = drag.offset + dx
  // 限制范围：[-DELETE_WIDTH, 0]，即只能往左滑出删除按钮
  if (next > 0) next = 0
  if (next < -DELETE_WIDTH) next = -DELETE_WIDTH
  drag.curOffset = next
  drag.curId = drag.id
}

function onPointerUp() {
  if (!drag.dragging) return
  drag.dragging = false
  const finalOffset = drag.curId === drag.id ? drag.curOffset : drag.offset
  if (finalOffset <= -DELETE_WIDTH / 2) {
    openId.value = drag.id
  } else {
    openId.value = ''
  }
}

function cardStyle(id: string) {
  const offset =
    drag.dragging && drag.id === id
      ? drag.curOffset
      : openId.value === id
        ? -DELETE_WIDTH
        : 0
  return {
    transform: `translateX(${offset}px)`,
    transition: drag.dragging && drag.id === id ? 'none' : 'transform 0.25s ease',
  }
}

function onCardClick() {
  // 如果刚完成滑动，忽略本次 click，避免滑动后立刻被收起
  if (drag.moved) {
    drag.moved = false
    return
  }
  // 点击已滑开的卡片，收起
  if (openId.value) {
    openId.value = ''
  }
}

// 删除二次确认
const confirmVisible = ref(false)
const pendingDeleteId = ref('')

function askDelete(id: string) {
  pendingDeleteId.value = id
  confirmVisible.value = true
}

function cancelDelete() {
  confirmVisible.value = false
  pendingDeleteId.value = ''
}

function confirmDelete() {
  const id = pendingDeleteId.value
  removeOrder(id)
  if (openId.value === id) openId.value = ''
  confirmVisible.value = false
  pendingDeleteId.value = ''
}
</script>

<template>
  <div class="profile-page">
    <header class="page-header">
      <button class="back-btn" @click="goHome">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">我的</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="profile-scroll">
      <div class="user-card">
        <div class="avatar">何</div>
        <div class="user-info">
          <h2 class="user-name">库库干饭的何女士</h2>
          <p class="user-meta">1521***1314 · 尊贵的永久会员</p>
        </div>
      </div>

    <section class="order-section">
      <h3 class="section-title">历史订单</h3>
      <div
        v-for="order in historyOrders"
        :key="order.id"
        class="swipe-item"
      >
        <button
          class="swipe-delete"
          @click="askDelete(order.id)"
        >删除</button>
        <div
          class="order-card"
          :style="cardStyle(order.id)"
          @pointerdown="onPointerDown($event, order.id)"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @click="onCardClick()"
        >
          <div class="order-head">
            <span class="order-time">{{ order.date }} {{ order.time }}</span>
            <span class="order-status" :class="statusClass(order.status)">{{ order.status }}</span>
          </div>
          <div class="order-body">
            <p class="order-items">{{ order.items.map(i => `${i.name}×${i.qty}`).join('、') }}</p>
            <div class="order-footer">
              <span class="order-count">共{{ order.items.reduce((a, b) => a + b.qty, 0) }}件</span>
              <span class="order-total">¥{{ order.total }}</span>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!historyOrders.length" class="order-empty">还没有下过单，去点几道菜吧～</p>
    </section>

    <section class="order-section">
      <h3 class="section-title">预点订单</h3>
      <div
        v-for="order in preOrders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-head">
          <span class="order-time">{{ order.date }}</span>
          <span class="order-status" :class="statusClass(order.status)">{{ order.status }}</span>
        </div>
        <div class="order-body">
          <p class="order-items">{{ order.items.map(i => `${i.name}×${i.qty}`).join('、') }}</p>
          <div class="order-footer">
            <span class="order-count">共{{ order.items.reduce((a, b) => a + b.qty, 0) }}件</span>
            <span class="order-total">¥{{ order.total }}</span>
          </div>
          <button
            v-if="isCurrentWeek(order)"
            class="edit-pre-btn"
            @click="editPreOrder"
          >修改本周预点菜</button>
          <p v-else class="history-tip">历史预点单不可修改</p>
        </div>
      </div>
      <p v-if="!preOrders.length" class="order-empty">还没有预点订单，去安排本周晚饭吧～</p>
      </section>
    </div>

    <!-- 删除二次确认弹窗 -->
    <div v-if="confirmVisible" class="confirm-mask" @click.self="cancelDelete">
      <div class="confirm-dialog">
        <h3 class="confirm-title">确认删除该订单？</h3>
        <p class="confirm-tip">删除后不可恢复，请谨慎操作</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="cancelDelete">取消</button>
          <button class="confirm-ok" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.profile-scroll {
  flex: 1;
  overflow-y: auto;
  padding-top: 60px;
  padding-bottom: 30px;
}

.page-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  /* background: rgba(255, 255, 255, 0.22); */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  color: #5a3e10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.header-placeholder {
  width: 36px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 12px 16px 10px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  box-shadow: 0 3px 10px rgba(245, 166, 35, 0.3);
}

.user-name {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.user-meta {
  font-size: 13px;
  color: #8a6d3b;
  margin: 0;
}

.order-section {
  padding: 0 16px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.order-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
  position: relative;
  z-index: 2;
  transition: transform 0.25s ease;
  touch-action: pan-y;
}

/* 左滑删除 */
.swipe-item {
  position: relative;
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 14px;
}

.swipe-item .order-card {
  margin-bottom: 0;
}

.swipe-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 72px;
  height: 100%;
  border: none;
  background: rgba(255, 77, 79, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* 拖拽时关闭过渡，松手恢复过渡 */
.swipe-item.dragging .order-card {
  transition: none;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-time {
  font-size: 13px;
  color: #8a6d3b;
}

.order-status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.status-done {
  background: rgba(245, 240, 230, 0.7);
  color: #99805a;
}

.status-deliver {
  background: rgba(245, 166, 35, 0.18);
  color: #c9760a;
}

.status-wait {
  background: rgba(245, 240, 230, 0.7);
  color: #99805a;
}

.order-items {
  font-size: 14px;
  color: #5a3e10;
  margin: 0 0 10px;
  line-height: 1.5;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-count {
  font-size: 12px;
  color: #99805a;
}

.order-total {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
}

.order-empty {
  font-size: 13px;
  color: #b59b73;
  text-align: center;
  padding: 24px 0;
  margin: 0;
}

.edit-pre-btn {
  margin-top: 12px;
  width: 100%;
  background: rgba(245, 166, 35, 0.15);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #c9760a;
  border: 1px solid rgba(245, 166, 35, 0.5);
  padding: 9px 0;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.history-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #b59b73;
}

/* 删除二次确认弹窗 */
.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.confirm-dialog {
  width: 78%;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 22px 20px 16px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(245, 166, 35, 0.25);
}

.confirm-title {
  font-size: 17px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.confirm-tip {
  font-size: 13px;
  color: #99805a;
  margin: 0 0 18px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-cancel,
.confirm-ok {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.confirm-cancel {
  background: rgba(245, 240, 230, 0.6);
  color: #99805a;
}

.confirm-ok {
  background: rgba(255, 77, 79, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
}
</style>
