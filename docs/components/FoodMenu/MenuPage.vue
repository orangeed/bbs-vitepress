<script setup lang="ts">
import { computed, ref } from 'vue'
import { store, goHome, goDishDetail, addToCart, removeFromCart, clearCart, openCheckout, closeCheckout, confirmOrder, closeSuccess, cartItems, getCartSubtotal, setPage } from './useStore'
import { dishes, subCategories } from './data'

const activeSub = ref('爽口凉菜')

const filteredDishes = computed(() => dishes.filter(d => d.category === activeSub.value))

const totalCount = computed(() => Object.values(store.cart).reduce((a, b) => a + b, 0))
const totalPrice = computed(() => getCartSubtotal(dishes))

const checkoutItems = computed(() => cartItems(dishes))
const checkoutTotal = computed(() => getCartSubtotal(dishes))
</script>

<template>
  <div class="menu-page">
    <header class="page-header">
      <button class="back-btn" @click="goHome">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <h1 class="page-title">直接点菜</h1>
      <div class="header-actions">
        <button class="icon-btn" @click="setPage('profile')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>
        <button class="icon-btn cart-btn" @click="setPage('profile')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span v-if="totalCount" class="cart-badge">{{ totalCount }}</span>
        </button>
      </div>
    </header>

    <div class="menu-body">
      <aside class="menu-sidebar">
        <button v-for="cat in subCategories" :key="cat" class="sidebar-item" :class="{ active: activeSub === cat }"
          @click="activeSub = cat">
          {{ cat }}
        </button>
      </aside>

      <main class="menu-list">
        <div v-for="dish in filteredDishes" :key="dish.id" class="dish-item" @click="goDishDetail(dish.id)">
          <img class="dish-img" :src="dish.image" :alt="dish.name" />
          <div class="dish-info">
            <h3 class="dish-name">{{ dish.name }}</h3>
            <p class="dish-price">¥{{ dish.price }}</p>
          </div>
          <div class="dish-actions">
            <button v-if="store.cart[dish.id]" class="minus-btn" @click.stop="removeFromCart(dish.id)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 13H5v-2h14v2z" />
              </svg>
            </button>
            <span v-if="store.cart[dish.id]" class="dish-qty">{{ store.cart[dish.id] }}</span>
            <button class="add-btn" @click.stop="addToCart(dish.id)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>

    <div class="bottom-bar">
      <span class="bottom-info">已选 {{ totalCount }} 道菜 · ¥{{ totalPrice }}</span>
      <button class="bottom-btn" @click="openCheckout">去结算</button>
    </div>

    <!-- 结算确认弹窗 -->
    <div v-if="store.showCheckout" class="checkout-mask" @click.self="closeCheckout">
      <div class="checkout-sheet">
        <div class="checkout-head">
          <h3 class="checkout-title">确认订单</h3>
          <button class="checkout-close" @click="closeCheckout">×</button>
        </div>
        <div class="checkout-list">
          <div v-for="ci in checkoutItems" :key="ci.dish.id" class="checkout-item">
            <span class="checkout-name">{{ ci.dish.name }}</span>
            <span class="checkout-qty">×{{ ci.qty }}</span>
            <span class="checkout-price">¥{{ ci.dish.price * ci.qty }}</span>
          </div>
        </div>
        <div class="checkout-total">
          <span>合计</span>
          <span class="checkout-total-price">¥{{ checkoutTotal }}</span>
        </div>
        <div class="checkout-actions">
          <button class="checkout-clear" @click="clearCart">清空</button>
          <button class="checkout-confirm" @click="confirmOrder(dishes)">确认下单</button>
        </div>
      </div>
    </div>

    <!-- 下单成功提示 -->
    <div v-if="store.showSuccess" class="success-mask" @click.self="closeSuccess">
      <div class="success-dialog">
        <div class="success-icon"></div>
        <h3 class="success-title">下单成功</h3>
        <p class="success-desc">订单已提交，我们会尽快为您准备</p>
        <button class="success-btn" @click="closeSuccess">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-page {
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.45);
  color: #5a3e10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.15);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f5a623;
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(245, 166, 35, 0.4);
}

.menu-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-top: 60px;
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
  transition: all 0.2s;
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

.dish-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.minus-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(245, 166, 35, 0.5);
  background: rgba(255, 255, 255, 0.6);
  color: #e8920c;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dish-qty {
  min-width: 22px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 4px;
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
  padding: 10px 24px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.3);
}

/* 结算确认弹窗 */
.checkout-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.checkout-sheet {
  width: 100%;
  max-width: 414px;
  background: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px 20px 0 0;
  padding: 18px 16px 22px;
  box-sizing: border-box;
  animation: slide-up 0.28s ease;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.checkout-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.checkout-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
}

.checkout-close {
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  color: #8a6d3b;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.checkout-list {
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.checkout-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(245, 166, 35, 0.15);
}

.checkout-name {
  flex: 1;
  font-size: 15px;
  color: #1a1a1a;
}

.checkout-qty {
  font-size: 13px;
  color: #8a6d3b;
  margin: 0 12px;
}

.checkout-price {
  font-size: 15px;
  font-weight: 700;
  color: #e8920c;
}

.checkout-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 16px;
  font-size: 15px;
  color: #5a3e10;
}

.checkout-total-price {
  font-size: 20px;
  font-weight: 800;
  color: #e8920c;
}

.checkout-confirm {
  width: 100%;
  background: rgba(245, 166, 35, 0.9);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 14px 0;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(245, 166, 35, 0.3);
}

.checkout-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkout-clear {
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.55);
  color: #e8920c;
  border: 1px solid rgba(245, 166, 35, 0.4);
  padding: 14px 20px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.checkout-actions .checkout-confirm {
  flex: 1;
}

/* 下单成功提示 */
.success-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
}

.success-dialog {
  width: 78%;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  padding: 28px 22px 22px;
  text-align: center;
  box-sizing: border-box;
  animation: pop-in 0.25s ease;
  box-shadow: 0 12px 40px rgba(245, 166, 35, 0.25);
}

@keyframes pop-in {
  from {
    transform: scale(0.85);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f9eb;
  position: relative;
  margin: 0 auto 14px;
}

.success-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 46%;
  width: 15px;
  height: 27px;
  border: solid #52c41a;
  border-width: 0 4px 4px 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

.success-title {
  font-size: 19px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.success-desc {
  font-size: 13px;
  color: #999;
  margin: 0 0 20px;
  line-height: 1.5;
}

.success-btn {
  width: 100%;
  background: #f5a623;
  color: #fff;
  border: none;
  padding: 12px 0;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
</style>
