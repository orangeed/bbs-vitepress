<script setup lang="ts">
import { computed } from 'vue'
import { store, goHome, setPage } from './useStore'
import { weekDays, dishes } from './data'

const currentDishes = computed(() => {
  const idx = store.selectedPreOrderDayIndex
  const ids = store.preOrderSelections[idx] || []
  return ids
    .map((id) => dishes.find((d) => d.id === id)?.name)
    .filter((name): name is string => Boolean(name))
})

function chooseDay(index: number) {
  store.selectedPreOrderDayIndex = index
}

function selectDishes() {
  setPage('preorder-menu')
}

function viewWeek() {
  setPage('preorder-summary')
}
</script>

<template>
  <div class="preorder-page">
    <header class="page-header">
      <button class="back-btn" @click="goHome">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">预点菜</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="preorder-content">
      <h2 class="preorder-title">安排本周晚饭</h2>
      <p class="preorder-subtitle">周一到周五，提前点好菜，回家直接做</p>

      <div class="day-tabs">
        <button
          v-for="(d, i) in weekDays"
          :key="i"
          class="day-tab"
          :class="{ active: store.selectedPreOrderDayIndex === i }"
          @click="chooseDay(i)"
        >
          <span class="day-name">{{ d.day }}</span>
          <span class="day-date">{{ d.date }}</span>
        </button>
      </div>

      <div class="selected-card">
        <h3 class="selected-title">已选菜品（{{ weekDays[store.selectedPreOrderDayIndex].day }}）</h3>
        <ul v-if="currentDishes.length" class="selected-list">
          <li v-for="dish in currentDishes" :key="dish">· {{ dish }}</li>
        </ul>
        <p v-else class="selected-empty">还没有选择菜品</p>
      </div>
    </div>

    <button class="big-action-btn" @click="selectDishes">
      为{{ weekDays[store.selectedPreOrderDayIndex].day }}选菜
    </button>
  </div>
</template>

<style scoped>
.preorder-page {
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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

.preorder-content {
  flex: 1;
  padding: 16px;
  padding-top: 70px;
}

.preorder-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.preorder-subtitle {
  font-size: 13px;
  color: #8a6d3b;
  margin: 0 0 20px;
}

.day-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.day-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #8a6d3b;
  cursor: pointer;
}

.day-tab.active {
  background: rgba(245, 166, 35, 0.85);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.day-name {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.day-date {
  font-size: 12px;
  opacity: 0.85;
}

.selected-card {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
}

.selected-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.selected-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.selected-list li {
  font-size: 14px;
  color: #7a623c;
  padding: 6px 0;
}

.selected-empty {
  font-size: 14px;
  color: #b59b73;
  margin: 0;
}

.big-action-btn {
  margin: 0 16px 20px;
  background: rgba(245, 166, 35, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 14px 0;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.3);
}
</style>
