<script setup lang="ts">
import { store, setPage } from './useStore'

function goMenu() {
  setPage('menu')
}

function goPreorder() {
  store.selectedPreOrderDayIndex = 0
  setPage('preorder-date')
}
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div>
        <h1 class="home-title">晚上好，今天想吃点什么？</h1>
        <p class="home-subtitle">陈氏川菜小炒 · 家的味道</p>
      </div>
      <button class="home-user" @click="setPage('profile')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </button>
    </header>

    <div class="action-wrapper">
      <div class="action-card" @click="goMenu">
        <div>
          <h2 class="action-title">直接点菜</h2>
          <p class="action-desc">马上选菜，下单后自取</p>
          <button class="action-btn">开始点菜</button>
        </div>
        <div class="action-img direct-img"></div>
      </div>

      <div class="action-card" @click="goPreorder">
        <div>
          <h2 class="action-title">预点菜</h2>
          <p class="action-desc">提前安排周一到周五晚饭</p>
          <button class="action-btn">安排一周</button>
        </div>
        <div class="action-img preorder-img"></div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.home-page {
  height: 100%;
  background: transparent;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.action-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.home-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
  line-height: 1.3;
}

.home-subtitle {
  font-size: 13px;
  color: #8a6d3b;
  margin: 0;
}

.home-user {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #5a3e10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.18);
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f0e6;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 16px;
}

.search-icon {
  color: #999;
  margin-right: 8px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-box input::placeholder {
  color: #aaa;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-tab {
  white-space: nowrap;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid #f0e6d4;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-tab.active {
  background: #f5a623;
  color: #fff;
  border-color: #f5a623;
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  padding: 24px 18px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 8px 24px rgba(245, 166, 35, 0.18);
}

.action-card:active {
  transform: scale(0.99);
}

.action-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.action-desc {
  font-size: 13px;
  color: #8a6d3b;
  margin: 0 0 14px;
}

.action-btn {
  background: rgba(245, 166, 35, 0.85);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
}

.action-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  margin-top: 16px;
}

.direct-img {
  background-image: url('https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=200&h=200&fit=crop');
}

.preorder-img {
  background-image: url('https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop');
}


.promo-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5a623;
  border-radius: 18px;
  padding: 18px;
  color: #fff;
}

.promo-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 6px;
}

.promo-desc {
  font-size: 13px;
  margin: 0;
  opacity: 0.95;
}

.promo-star {
  opacity: 0.9;
}
</style>
