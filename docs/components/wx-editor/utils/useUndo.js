/**
 * 撤销 / 重做组合式函数：手动历史栈，输入停顿 UNDO_DEBOUNCE 后自动快照。
 * text 为编辑器内容 ref，render 为重渲染回调，toast 为提示回调。
 */
import { UNDO_MAX, UNDO_DEBOUNCE } from './constants';

export function useUndo(text, { render, toast }) {
  let undoStack = [''];
  let undoIndex = 0;
  let undoTimer = null;
  let isUndoing = false;

  function pushHistory() {
    if (isUndoing) return; // 自己设值时跳过
    // 截断未来分支：撤销后改过内容就回不去了
    if (undoIndex < undoStack.length - 1) undoStack.length = undoIndex + 1;
    const v = text.value;
    if (v === undoStack[undoStack.length - 1]) return; // 去重：内容未变不推
    undoStack.push(v);
    if (undoStack.length > UNDO_MAX) undoStack.shift();
    undoIndex = undoStack.length - 1;
  }

  function schedulePush() {
    clearTimeout(undoTimer);
    undoTimer = setTimeout(pushHistory, UNDO_DEBOUNCE);
  }

  function undo() {
    if (undoIndex <= 0) return toast('已是最早');
    undoIndex--;
    isUndoing = true;
    text.value = undoStack[undoIndex];
    render();
    isUndoing = false;
    toast('已撤销');
  }

  function redo() {
    if (undoIndex >= undoStack.length - 1) return toast('已是最新');
    undoIndex++;
    isUndoing = true;
    text.value = undoStack[undoIndex];
    render();
    isUndoing = false;
    toast('已重做');
  }

  function resetHistory(v) {
    clearTimeout(undoTimer);
    undoStack = [v || ''];
    undoIndex = 0;
    isUndoing = false;
  }

  /** 组件卸载时清理定时器 */
  function dispose() {
    clearTimeout(undoTimer);
  }

  return { pushHistory, schedulePush, undo, redo, resetHistory, dispose };
}
