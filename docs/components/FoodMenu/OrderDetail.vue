<template>
  <div class="order-detail-page" v-if="store.selectedOrder">
    <header class="page-header">
      <button class="back-btn" @click="closeOrderDetail">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <h2 class="page-title">订单详情</h2>
    </header>

    <div class="detail-scroll">
      <div class="detail-meta">
        <div class="meta-item">
          <span class="meta-label">下单时间</span>
          <span class="meta-value">{{ orderTime }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">订单类型</span>
          <span class="meta-value">{{ orderTypeText }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">订单状态</span>
          <span class="meta-value status" :class="{ [statusClass]: statusClass }">{{ orderStatusText }}</span>
        </div>
      </div>

      <h3 class="section-title">菜品清单</h3>
      <div class="detail-dishes">
        <div class="detail-dish" v-for="item in detailItems" :key="item.name">
          <div class="dd-info">
            <span class="dd-name">{{ item.name }}</span>
            <span class="dd-price">¥{{ item.price }} × {{ item.qty }}</span>
          </div>
          <span class="dd-subtotal">¥{{ item.price * item.qty }}</span>
        </div>
      </div>

      <div class="detail-total">
        <span>合计</span>
        <span class="detail-total-price">¥{{ total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store, closeOrderDetail } from './useStore'
import { dishes as dishList } from './data'

const order = computed(() => store.selectedOrder!)

const orderTime = computed(() => {
  // 优先使用完整下单时间 createdAt（年-月-日 时:分:秒）
  if (order.value.createdAt) return order.value.createdAt
  // 旧订单回退：即时单 time="HH:mm"，预点单 time="" 用 date
  return order.value.time || order.value.date
})

const orderTypeText = computed(() => order.value.type === 'preorder' ? '预点单' : '即时单')

const orderStatusText = computed(() => order.value.status)

const statusClass = computed(() => {
  switch (order.value.status) {
    case '待确认': return 'status-pending'
    case '配送中': return 'status-doing'
    case '已完成': return 'status-done'
    default: return ''
  }
})

const detailItems = computed(() => order.value.items.map((it) => {
  const dish = dishList.find((d) => d.name === it.name)
  return {
    name: it.name,
    price: dish ? dish.price : 0,
    qty: it.qty,
  }
}))

const total = computed(() => detailItems.value.reduce((sum, it) => sum + it.price * it.qty, 0))
</script>

<style scoped>
.order-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 14px 16px;
  /* background: rgba(255, 255, 255, 0.72); */
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  /* border-bottom: 1px solid rgba(0, 0, 0, 0.06); */
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #e8920c;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.94);
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #1a1a1a;
  margin-right: 36px;
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-meta {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 18px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 7px 0;
  font-size: 14px;
}

.meta-item + .meta-item {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.meta-label {
  color: #888;
  flex-shrink: 0;
}

.meta-value {
  color: #1a1a1a;
  font-weight: 600;
  text-align: right;
  max-width: 70%;
}

.meta-value.status {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
}

.status-pending {
  background: rgba(245, 166, 35, 0.15);
  color: #e8920c;
}

.status-doing {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
}

.status-done {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.detail-dishes {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 16px;
  padding: 6px 16px;
}

.detail-dish {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.detail-dish + .detail-dish {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.dd-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dd-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.dd-price {
  font-size: 13px;
  color: #888;
}

.dd-subtotal {
  font-size: 15px;
  font-weight: 700;
  color: #e8920c;
}

.detail-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  padding: 14px 16px;
  background: rgba(245, 166, 35, 0.12);
  border: 1px solid rgba(245, 166, 35, 0.25);
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.detail-total-price {
  color: #e8920c;
  font-size: 18px;
}
</style>
