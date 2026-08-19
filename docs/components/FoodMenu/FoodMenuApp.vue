<script setup lang="ts">
import { store } from './useStore'
import HomePage from './HomePage.vue'
import MenuPage from './MenuPage.vue'
import DishDetail from './DishDetail.vue'
import PreorderDate from './PreorderDate.vue'
import PreorderMenu from './PreorderMenu.vue'
import PreorderSummary from './PreorderSummary.vue'
import ProfilePage from './ProfilePage.vue'
</script>

<template>
  <div class="food-menu-app">
    <div class="phone-frame">
      <HomePage v-if="store.currentPage === 'home'" />
      <MenuPage v-else-if="store.currentPage === 'menu'" />
      <DishDetail v-else-if="store.currentPage === 'detail'" />
      <PreorderDate v-else-if="store.currentPage === 'preorder-date'" />
      <PreorderMenu v-else-if="store.currentPage === 'preorder-menu'" />
      <PreorderSummary v-else-if="store.currentPage === 'preorder-summary'" />
      <ProfilePage v-else-if="store.currentPage === 'profile'" />
    </div>
  </div>
</template>

<style scoped>
.food-menu-app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: linear-gradient(160deg, #ffe8c2 0%, #ffd6a0 45%, #f5a623 100%);
  padding: 20px;
  box-sizing: border-box;
}

.phone-frame {
  width: 100%;
  max-width: 414px;
  min-height: 736px;
  background: linear-gradient(160deg, #fff3dc 0%, #ffe9c9 50%, #ffd9a8 100%);
  border-radius: 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  overflow: hidden;
  position: relative;
}

/* 背景柔光斑点，增强毛玻璃层次感 */
.phone-frame::before {
  content: '';
  position: absolute;
  top: -60px;
  left: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%);
  filter: blur(10px);
  pointer-events: none;
  z-index: 0;
}

.phone-frame::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(245,166,35,0.45), transparent 70%);
  filter: blur(10px);
  pointer-events: none;
  z-index: 0;
}

@media (max-width: 480px) {
  .food-menu-app {
    padding: 0;
    background: #fffcf5;
  }
  .phone-frame {
    max-width: 100%;
    min-height: 100vh;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
