<script setup lang="ts">
import { computed, ref } from 'vue'
import { store, setPage, confirmPreOrder, closePreSuccess } from './useStore'
import { dishes, weekDays } from './data'

const email = ref('')

const weekList = computed(() => {
  return weekDays.map((day, idx) => {
    const ids = store.preOrderSelections[idx] || []
    const dishNames = ids
      .map((id) => dishes.find((d) => d.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    return {
      day: `${day.day} ${day.date}`,
      dishes: dishNames,
    }
  })
})

const totalCount = computed(() =>
  weekList.value.reduce((sum, day) => sum + day.dishes.length, 0)
)

function confirm() {
  confirmPreOrder(dishes)
}
</script>

<template>
  <div class="summary-page">
    <header class="page-header">
      <button class="back-btn" @click="setPage('preorder-menu')">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      <h1 class="page-title">本周预点菜</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="summary-content">
      <div
        v-for="day in weekList"
        :key="day.day"
        class="day-card"
      >
        <h3 class="day-title">{{ day.day }}</h3>
        <p class="day-dishes">{{ day.dishes.join('、') || '暂无菜品' }}</p>
      </div>

      <div class="email-section">
        <label class="email-label">接收预点菜清单邮箱</label>
        <input v-model="email" type="email" placeholder="your@email.com" />
      </div>
    </div>

    <div class="summary-footer">
      <span class="total-info">共 {{ totalCount }} 道菜</span>
      <button class="confirm-btn" @click="confirm">确认预点菜</button>
    </div>

    <!-- 预点成功提示 -->
    <div v-if="store.showPreSuccess" class="success-mask" @click.self="closePreSuccess">
      <div class="success-dialog">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#52c41a" stroke-width="3">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="success-title">预点成功</h3>
        <p class="success-desc">本周预点菜已提交，可随时返回修改</p>
        <button class="success-btn" @click="closePreSuccess">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-page {
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

.summary-content {
  flex: 1;
  padding: 16px;
  padding-top: 70px;
  padding-bottom: 90px;
}

.day-card {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.12);
}

.day-title {
  font-size: 15px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.day-dishes {
  font-size: 13px;
  color: #99805a;
  margin: 0;
  line-height: 1.5;
}

.email-section {
  margin-top: 10px;
}

.email-label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.email-section input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 14px;
  color: #333;
  outline: none;
  box-sizing: border-box;
}

.email-section input::placeholder {
  color: #b59b73;
}

.summary-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 16px rgba(245, 166, 35, 0.12);
  box-sizing: border-box;
}

.total-info {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
}

.confirm-btn {
  flex: 1;
  margin-left: 16px;
  background: rgba(245, 166, 35, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 13px 0;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(245, 166, 35, 0.3);
}

/* 预点成功提示 */
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
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  padding: 28px 22px 22px;
  text-align: center;
  box-sizing: border-box;
  animation: pop-in 0.25s ease;
  box-shadow: 0 12px 40px rgba(245, 166, 35, 0.25);
}

@keyframes pop-in {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0f9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
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
