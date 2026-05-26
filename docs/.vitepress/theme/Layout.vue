<script setup>
import { ref, onMounted } from 'vue'
import BlogTheme from '@sugarat/theme'
import { useData } from 'vitepress'
import { toggleDark } from './Dark'
import BG from './assets/bg1.webp'
import { ElImage } from 'element-plus'

const { Layout } = BlogTheme
const { isDark } = useData()

// 实现切换主题过渡动画
toggleDark(isDark)

// --- 响应式变量 ---
const showPreview = ref(false)       // 控制弹窗的显示与隐藏
const currentImgUrl = ref(BG)        // 记录【当前大背景】正在使用的 Blob URL
const isInitialLoading = ref(true)   // 页面初次加载第一张图的 Loading 状态

// --- 核心逻辑 ---

// 封装：获取随机图并转为 Blob URL
const fetchRandomBlobUrl = async () => {
    const randomId = Math.floor(Math.random() * 10000);
    const newImgUrl = `https://unsplash.it/2560/1440?random=${randomId}`;
    try {
        const response = await fetch(newImgUrl);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("加载背景图失败:", error);
        return '';
    }
}

// 点击“切换背景”按钮
const handleChangeBg = async () => {
    const bg = document.getElementsByClassName('VPHome')[0];
    if (!bg) return;

    // 1. 去后台偷偷下载一张新图
    const newBlobUrl = await fetchRandomBlobUrl();
    if (!newBlobUrl) return;

    // 2. 先塞给隐藏的顶层
    bg.style.setProperty('--next-bg-img', `url(${newBlobUrl})`);

    requestAnimationFrame(() => {
        // 3. 拉开大幕，新图缓缓淡入
        bg.classList.add('is-fading-in');

        setTimeout(() => {
            // 4. 800ms 动画结束，底层老图无缝替换成新图
            bg.style.setProperty('--current-bg-img', `url(${newBlobUrl})`);
            bg.classList.remove('is-fading-in');
            bg.style.setProperty('--next-bg-img', 'none');

            // 5. ✨【关键改动】大图完全切换成功后，再更新响应式变量
            // 这样弹窗里的图片就会自动刷新成最新的当前背景
            const oldUrl = currentImgUrl.value;
            currentImgUrl.value = newBlobUrl;

            // 6. 释放上一张图的内存
            if (oldUrl) URL.revokeObjectURL(oldUrl);

        }, 800);
    });
};

// 点击别处时可以关闭弹窗（可选体验优化）
const togglePopover = (e) => {
    e.stopPropagation(); // 阻止冒泡，防止触发全局关闭
    showPreview.value = !showPreview.value;
}
</script>

<template>
    <Layout>
        <template #nav-bar-content-after>
            <div class="change-bg-wrapper">

                <div class="click-area" @click="handleChangeBg" title="点击切换下一张背景">
                    <span>切换背景</span>
                    <img src='../../public/change.png' width="20" alt="切换背景" />
                </div>

                <div class="view-eye-btn" :class="{ 'is-active': showPreview }" @click="togglePopover"
                    title="查看/右键下载当前背景">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </div>

                <div v-if="showPreview" class="bg-current-popover">
                    <div class="popover-arrow"></div>
                    <div class="popover-title">当前背景（点击放大保存）</div>
                    <div class="popover-content">
                        <el-image v-if="currentImgUrl" :src="currentImgUrl"
                            :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="[currentImgUrl]"
                            show-progress :preview-teleported="true" :initial-index="4" fit="cover" />
                        <!-- <img v-if="currentImgUrl" :src="currentImgUrl" class="content-container" alt="当前背景图，右键另存为下载" /> -->
                        <div v-else-if="isInitialLoading" class="loading-text">背景初始化中...</div>
                        <div v-else class="loading-text">暂无背景数据</div>
                    </div>
                </div>

            </div>
        </template>
    </Layout>
</template>

<style scoped>
/* 包含按钮和弹窗的组合容器 */
.change-bg-wrapper {
    position: relative;
    /* 子绝父相基准 */
    margin-left: 10px;
    display: flex;
    align-items: center;
    background: var(--vp-c-bg-mute);
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    padding: 2px;
}

/* 左侧点击切背景区域 */
.click-area {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
    user-select: none;

    span {
        font-size: 12px;
        margin-right: 5px;
        color: var(--vp-c-text-1);
    }
}

.click-area:hover {
    background: var(--vp-c-bg);
}

/* 右侧小眼睛查看按钮 */
.view-eye-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 4px;
    color: var(--vp-c-text-2);
    transition: all 0.2s;
}

.view-eye-btn:hover,
.view-eye-btn.is-active {
    color: var(--vp-c-brand-1);
    background: var(--vp-c-bg);
}

/* 弹出层主面板 */
.bg-current-popover {
    position: absolute;
    top: 100%;
    /* 刚好在按钮下方 */
    right: 0;
    /* 靠右对齐，防止溢出屏幕 */
    margin-top: 10px;
    width: 220px;
    /* 稍微放大一点，方便用户看清和右键 */
    background: rgba(var(--vp-c-bg-rgb, 255, 255, 255), 0.9);
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    padding: 10px;
    z-index: 999;
    animation: fadeIn 0.2s ease-out;
    backdrop-filter: blur(8px);
}

:deep(.dark) .bg-current-popover {
    background: rgba(30, 30, 30, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

/* 小标题提示语 */
.popover-title {
    color: var(--vp-c-text-2);
    font-size: 11px;
    margin-bottom: 8px;
    text-align: center;
    font-weight: bold;
}

/* 图片容器 */
.popover-content {
    width: 100%;
    height: 112px;
    /* 16:9 比例 */
    border-radius: 4px;
    overflow: hidden;
    background: var(--vp-c-bg-mute);
    display: flex;
    align-items: center;
    justify-content: center;
}

.popover-content img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: context-menu;
    /* 提示用户这里可以唤起右键菜单 */
    transition: opacity 0.3s;
}

/* 弹窗小三角箭头 */
.popover-arrow {
    position: absolute;
    top: -6px;
    right: 10px;
    /* 箭头对齐眼睛图标 */
    transform: rotate(45deg);
    width: 10px;
    height: 10px;
    background: rgba(var(--vp-c-bg-rgb, 255, 255, 255), 0.9);
    border-left: 1px solid var(--vp-c-divider);
    border-top: 1px solid var(--vp-c-divider);
}

:deep(.dark) .popover-arrow {
    background: rgba(30, 30, 30, 0.9);
    border-color: rgba(255, 255, 255, 0.1) transparent transparent rgba(255, 255, 255, 0.1);
}

.loading-text {
    color: var(--vp-c-text-3);
    font-size: 11px;
}

/* 弹窗淡入动画 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>