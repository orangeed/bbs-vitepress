<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import BlogTheme from '@sugarat/theme'
import { useData } from 'vitepress'
import { toggleDark } from './Dark'
const { Layout } = BlogTheme

const { isDark } = useData()
// 实现切换主题过渡动画
toggleDark(isDark)

// 切换背景
const handleChangeBg = () => {
    const bg = document.getElementsByClassName('VPHome')[0];
    const randomId = Math.floor(Math.random() * 10000);
    // const newImgUrl = `https://picsum.photos/1920/1080?random=${randomId}`;
    const newImgUrl = `https://loremflickr.com/1920/1080/nature,landscape?lock=${randomId}`;

    // 【第一步】后台预加载新图片
    const img = new Image();
    img.src = newImgUrl;

    img.onload = () => {
        // 【第二步】图片下载好了！先把新图偷偷塞给隐藏的顶层（::after）
        bg.style.setProperty('--next-bg-img', `url(${newImgUrl})`);

        // 告诉浏览器准备动画
        requestAnimationFrame(() => {
            // 【第三步】拉开大幕！加上类名，让顶层的新图缓缓“淡入”覆盖在老图上面
            bg.classList.add('is-fading-in');

            // 【第四步】善后工作。等待 800ms（必须和 CSS 中的 0.8s 过渡时间一致）
            setTimeout(() => {
                // 此时新图已经完全不透明了，成功遮住了老图。
                // 我们在幕后悄悄把底层的老图（::before）换成这张新图。
                bg.style.setProperty('--current-bg-img', `url(${newImgUrl})`);

                // 瞬间把顶层（::after）恢复成透明状态，并清空变量。
                // 因为底层已经无缝变成了新图，所以用户完全察觉不到这个瞬间重置。
                bg.classList.remove('is-fading-in');
                bg.style.setProperty('--next-bg-img', 'none');

            }, 800);
        });
    };

    img.onerror = () => {
        // 失败重置状态
        bg.classList.remove('is-fading-in');
        bg.style.setProperty('--next-bg-img', 'none');
    };
};

</script>

<template>
    <Layout>
        <!-- <template #doc-before>
            <div class="custom-slot">
                🚀 在文章内容前插入自定义内容
            </div>
        </template> -->
        <template #nav-bar-content-after>
            <div class="change-bg" @click="handleChangeBg">
                <span>切换背景</span>
                <img src='../../public/change.png' width="20" @click="handleChangeBg" alt="切换背景" />
            </div>
        </template>
    </Layout>
</template>

<style scoped>
.change-bg {
    cursor: pointer;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
        font-size: 12px;
        margin-right: 5px;
    }
}
</style>