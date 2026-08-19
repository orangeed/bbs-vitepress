<script setup lang="ts">
import { computed, ref } from 'vue'
import { store, setPage, goDishDetail, togglePreDish, isPreSelected } from './useStore'
import { dishes, subCategories, weekDays } from './data'

const activeSub = ref('爽口凉菜')
const filteredDishes = computed(() => dishes.filter(d => d.category === activeSub.value))

const dayName = weekDays[store.selectedPreOrderDayIndex]?.day || '周一'

const selectedCount = computed(() => {
  const list = store.preOrderSelections[store.selectedPreOrderDayIndex] || []
  return list.length
})

function toggleDish(id: string) {
  togglePreDish(store.selectedPreOrderDayIndex, id)
}

function isSelected(id: string) {
  return isPreSelected(store.selectedPreOrderDayIndex, id)
}

function goDate() {
  setPage('preorder-date')
}

function goSummary() {
  setPage('preorder-summary')
}
</script>

<template>
  <div class="preorder-menu-page">
    <header class="page-header">
      <button class="back-btn" @click="goDate">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">预点菜</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="week-bar">
      <button
        v-for="(d, i) in weekDays"
        :key="i"
        class="week-tab"
        :class="{ active: store.selectedPreOrderDayIndex === i }"
        @click="store.selectedPreOrderDayIndex = i"
      >
        <span class="week-day">{{ d.day }}</span>
        <span class="week-date">{{ d.date }}</span>
      </button>
    </div>

    <div class="menu-body">
      <aside class="menu-sidebar">
        <button
          v-for="cat in subCategories"
          :key="cat"
          class="sidebar-item"
          :class="{ active: activeSub === cat }"
          @click="activeSub = cat"
        >
          {{ cat }}
        </button>
      </aside>

      <main class="menu-list">
        <div
          v-for="dish in filteredDishes"
          :key="dish.id"
          class="dish-item"
          @click="goDishDetail(dish.id)"
        >
          <img class="dish-img" :src="dish.image" :alt="dish.name" />
          <div class="dish-info">
            <h3 class="dish-name">{{ dish.name }}</h3>
            <p class="dish-price">¥{{ dish.price }}</p>
          </div>
          <button
            class="add-btn"
            :class="{ selected: isSelected(dish.id) }"
            @click.stop="toggleDish(dish.id)"
          >
            <svg v-if="!isSelected(dish.id)" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>
        </div>
      </main>
    </div>

    <div class="bottom-bar">
      <span class="bottom-info">{{ dayName }}已选 {{ selectedCount }} 道菜</span>
      <button class="bottom-btn" @click="goSummary">查看本周</button>
    </div>
  </div>
</template>

<style scoped>
.preorder-menu-page {
  height: 100%;
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

.week-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  padding-top: 64px;
}

.week-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.4);
  color: #8a6d3b;
  cursor: pointer;
}

.week-tab.active {
  background: rgba(245, 166, 35, 0.85);
  border-color: rgba(255, 255, 255, 0.5);
  color: #fff;
}

.week-day {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 3px;
}

.week-date {
  font-size: 11px;
  opacity: 0.85;
}

.menu-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-bottom: 70px;
}

.menu-sidebar {
  width: 90px;
  background: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
  padding: 8px 0;
  overflow-y: auto;
}

.sidebar-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 16px 10px;
  font-size: 13px;
  color: #8a6d3b;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
}

.sidebar-item.active {
  background: rgba(245, 166, 35, 0.85);
  color: #fff;
  font-weight: 700;
}

.menu-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.dish-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 10px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
  cursor: pointer;
}

.dish-img {
  width: 66px;
  height: 66px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.dish-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.dish-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.dish-price {
  font-size: 15px;
  font-weight: 700;
  color: #e8920c;
  margin: 0;
}

.add-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: rgba(245, 166, 35, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(245, 166, 35, 0.3);
}

.add-btn.selected {
  background: rgba(82, 196, 26, 0.85);
  border-color: rgba(255, 255, 255, 0.5);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.55);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 16px rgba(245, 166, 35, 0.12);
  box-sizing: border-box;
}

.bottom-info {
  font-size: 14px;
  color: #5a3e10;
}

.bottom-btn {
  background: rgba(245, 166, 35, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.3);
}
</style>
