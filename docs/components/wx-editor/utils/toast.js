/**
 * 全局单例 toast：任意模块 import 同一份状态，
 * WxEditor.vue 负责渲染，其余模块直接调用 toast() 弹提示。
 */
import { ref } from 'vue';

const toastShow = ref(false);
const toastText = ref('');
let toastTimer = null;

function toast(msg) {
  toastText.value = msg;
  toastShow.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastShow.value = false;
  }, 2000);
}

export function useToast() {
  return { toast, toastShow, toastText };
}
