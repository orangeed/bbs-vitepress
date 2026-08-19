<template>
  <div class="order-detail-page" v-if="store.selectedOrder">
    <header class="page-header">
      <button class="back-btn" @click="closeOrderDetail">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <h2 class="page-title">订单详情</h2>
      <button class="save-btn" :disabled="saving" @click="saveImage">
        {{ saving ? '保存中…' : '保存图片' }}
      </button>
    </header>

    <div class="detail-scroll">
      <div class="mail-wrapper" ref="mailRef" v-html="mailHtml"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toPng } from 'html-to-image'
import { store, closeOrderDetail } from './useStore'
import { selectMailTemplate } from './mailTemplates'

const order = computed(() => store.selectedOrder!)
const mailRef = ref<HTMLElement | null>(null)
const saving = ref(false)

// 订单详情直接复用发送邮件的同款 HTML 模板，保证样式一致
const mailHtml = computed(() => selectMailTemplate(order.value).buildHtml(order.value))

async function saveImage() {
  const node = mailRef.value
  if (!node) return
  saving.value = true
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      // backgroundColor: '#ffffff',
    })
    const link = document.createElement('a')
    link.download = `订单-${order.value.id}.png`
    link.href = dataUrl
    link.click()
  } catch (e) {
    console.error('保存图片失败', e)
  } finally {
    saving.value = false
  }
}
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
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
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
  margin-right: 12px;
}

.save-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: rgba(245, 166, 35, 0.9);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(245, 166, 35, 0.3);
  transition: transform 0.1s ease, opacity 0.2s ease;
}

.save-btn:active {
  transform: scale(0.96);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.detail-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.mail-wrapper {
  max-width: 480px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
}
</style>
