<script setup lang="ts">
import { computed, ref } from 'vue'
import { store, goHome, addToCart } from './useStore'
import { dishes } from './data'

const dish = computed(() => dishes.find(d => d.id === store.selectedDishId) || dishes[0])
const qty = ref(1)

function goBack() {
  store.currentPage = 'menu'
}

function addAndBack() {
  addToCart(dish.value.id, qty.value)
  qty.value = 1
  store.currentPage = 'menu'
}
</script>

<template>
  <div class="detail-page">
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">菜品详情</h1>
      <button class="more-btn">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </header>

    <div class="detail-cover">
      <img :src="dish.image" :alt="dish.name" />
    </div>

    <div class="detail-body">
      <div class="detail-head">
        <h2 class="detail-name">{{ dish.name }}</h2>
        <span class="detail-price">¥{{ dish.price }}</span>
      </div>

      <div class="detail-tags">
        <span v-for="tag in dish.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <p class="detail-desc">{{ dish.desc }}</p>

      <div v-if="dish.ingredients" class="ingredients">
        <h3 class="section-title">食材组成</h3>
        <div class="ingredient-row">
          <span class="ingredient-label">主菜</span>
          <span class="ingredient-value">{{ dish.ingredients.main }}</span>
        </div>
        <div class="ingredient-row">
          <span class="ingredient-label">配菜</span>
          <span class="ingredient-value">{{ dish.ingredients.side }}</span>
        </div>
        <div class="ingredient-row">
          <span class="ingredient-label">调料</span>
          <span class="ingredient-value">{{ dish.ingredients.seasonings }}</span>
        </div>
      </div>
    </div>

    <div class="detail-footer">
      <div class="qty-control">
        <button @click="qty > 1 ? qty-- : null">−</button>
        <span>{{ qty }}</span>
        <button @click="qty++">+</button>
      </div>
      <button class="add-order-btn" @click="addAndBack">加入订单</button>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
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

.back-btn,
.more-btn {
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

.detail-cover {
  width: 100%;
  height: 260px;
  background: #ffe8b8;
  overflow: hidden;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-body {
  flex: 1;
  padding: 18px 16px;
  padding-bottom: 100px;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.detail-name {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
}

.detail-price {
  font-size: 20px;
  font-weight: 800;
  color: #f5a623;
}

.detail-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.tag {
  background: rgba(245, 166, 35, 0.15);
  color: #c9760a;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.detail-desc {
  font-size: 14px;
  line-height: 1.7;
  color: #7a623c;
  margin: 0 0 22px;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.ingredients {
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
}

.ingredient-row {
  display: flex;
  font-size: 14px;
  margin-bottom: 10px;
}

.ingredient-row:last-child {
  margin-bottom: 0;
}

.ingredient-label {
  color: #999;
  width: 50px;
  flex-shrink: 0;
}

.ingredient-value {
  color: #333;
  flex: 1;
}

.detail-footer {
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

.qty-control {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 4px 6px;
}

.qty-control button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(245, 166, 35, 0.85);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(245, 166, 35, 0.3);
}

.qty-control span {
  min-width: 24px;
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #1a1a1a;
}

.add-order-btn {
  flex: 1;
  margin-left: 16px;
  background: rgba(245, 166, 35, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 13px 0;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.3);
}
</style>
