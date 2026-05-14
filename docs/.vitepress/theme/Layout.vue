<!-- .vitepress/theme/MyLayout.vue -->
<script setup>
import BlogTheme from '@sugarat/theme'
import { useData } from 'vitepress'
import { toggleDark } from './Dark'
const { Layout } = BlogTheme

const { isDark } = useData()
// 实现切换主题过渡动画
toggleDark(isDark)
</script>

<template>
    <Layout>
        <!-- <template #doc-before>
            <div class="custom-slot">
                🚀 在文章内容前插入自定义内容
            </div>
        </template> -->
    </Layout>
</template>

<style scoped>
.custom-slot {
    padding: 10px;
    background-color: var(--vp-c-bg-alt);
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
    color: var(--vp-c-brand);
    font-weight: bold;
}
</style>