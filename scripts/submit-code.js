// PTA：提交当前编程题（有副作用！点了就真提交，没有二次确认）。
// args: { close: true } 默认 true —— 抓完「提交结果」弹窗后自动关掉。
// 返回 状态 / 分数 / 弹窗正文；PTA 即时评测，通常几十毫秒出结果。
const a = args || {};
const doClose = a.close !== false;
const code = String.raw`
var btn = [].slice.call(document.querySelectorAll('button')).filter(function (b) {
  return (b.innerText || '').trim() === '提交本题作答' && b.getBoundingClientRect().width > 0;
})[0];
if (!btn) return {ok: false, err: '没找到「提交本题作答」按钮'};
btn.click();
await new Promise(function (r) { setTimeout(r, 4000); });
var modal = document.querySelector('.pc-modal');
var text = modal ? modal.innerText.replace(/[ \t]+/g, ' ').trim() : '';
var out = {
  ok: true,
  status: (text.match(/状态\s*(\S+)/) || [])[1] || null,
  score: (text.match(/分数\s*([\d.]+)\s*\/\s*(\d+)/) || []).slice(1).join('/') || null,
  result: text.slice(0, 600)
};
if (${doClose} && modal) {
  var close = modal.querySelector('[data-e2e="modal-close-btn"]');
  if (!close) {
    close = [].slice.call(modal.querySelectorAll('button')).filter(function (b) {
      return /^(确认|确定|关闭)$/.test((b.innerText || '').trim());
    })[0];
  }
  if (close) { close.click(); out.closed = true; }
}
return out;
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
