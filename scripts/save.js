// PTA：点填空题 / 程序填空题页面底部的「保存」（一页多题共用一个保存按钮）。
// 无参数。返回点完后是否还挂着「N 题答案待保存」提示。
const code = String.raw`
var btn = [].slice.call(document.querySelectorAll('button')).filter(function (b) {
  return (b.innerText || '').trim() === '保存' && b.getBoundingClientRect().width > 0;
})[0];
if (!btn) return {ok: false, err: '没找到「保存」按钮（位置对了吗？）'};
btn.click();
await new Promise(function (r) { setTimeout(r, 3000); });
return {
  ok: true,
  pendingSave: (document.body.innerText.match(/\d+\s*题答案待保存/) || [])[0] || null
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
