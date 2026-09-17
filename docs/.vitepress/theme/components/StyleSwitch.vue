<script setup lang="ts">
/**
 * 全站视觉风格切换器（顶栏 / 移动端抽屉复用）。
 *
 * 使用 animal-island-vue 的 Select；配色由全局主题层统一改写
 * （styles/themes.scss 的「animal-island-vue 下拉主题化」段），
 * 这里只处理两处布局差异：顶栏紧凑版、抽屉整行版，以及强调色圆点预览。
 */
import { computed, onMounted } from 'vue'
import { Select } from 'animal-island-vue'
import { STYLE_OPTIONS, activeStyle, setStyle, currentOption, initStyleTheme } from '../useStyleTheme'

const props = withDefaults(defineProps<{
  /** 整行模式（移动端抽屉）：触发器铺满、选项带说明文案 */
  block?: boolean
}>(), { block: false })

const selectOptions = computed(() =>
  STYLE_OPTIONS.map(s => ({
    key: s.id,
    // 顶栏空间有限，只显示名称；抽屉里附带一句话风格说明
    label: props.block ? `${s.name} · ${s.hint}` : s.name,
  })),
)

onMounted(initStyleTheme)
</script>

<template>
  <div class="style-switch" :class="{ 'is-block': block }" :style="{ '--preview': currentOption().preview }">
    <Select
      :model-value="activeStyle"
      :options="selectOptions"
      aria-label="选择全站视觉风格"
      @update:model-value="setStyle"
    />
  </div>
</template>

<style scoped>
.style-switch {
  display: inline-flex;
  align-items: center;
}

.style-switch :deep(.animal-select) {
  min-width: 0;
}

.style-switch :deep(.animal-select__value) {
  white-space: nowrap;
}

/* 强调色圆点：用当前风格的 accent 做预览，让选择有直观反馈 */
.style-switch :deep(.animal-select__value)::before {
  content: '';
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: var(--radius-full);
  background: var(--preview, var(--accent));
  border: 1px solid var(--line-strong);
}

/* 抽屉内：整行铺满 */
.style-switch.is-block,
.style-switch.is-block :deep(.animal-select) {
  width: 100%;
}

.style-switch.is-block :deep(.animal-select__trigger) {
  justify-content: flex-start;
}
</style>
