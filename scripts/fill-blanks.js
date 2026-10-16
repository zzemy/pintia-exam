// PTA：填填空题 / 程序填空题的空格（React 受控 input，必须原生 setter + 事件）。
// args（三选一）：
//   { values: ["a","b"] }          从第 0 个空格开始按顺序填
//   { start: 9, values: ["a"] }    从第 start 个空格开始
//   { map: { "0": "1", "3": "x" } } 按空格下标填
// 填完每个框回读 value 核对。空格顺序先用 read-blanks.js 确认。
const a = args || {};
let plan = [];
if (a.map) {
  plan = Object.keys(a.map).map(k => [Number(k), String(a.map[k])]);
} else if (Array.isArray(a.values)) {
  const start = Number(a.start || 0);
  plan = a.values.map((v, k) => [start + k, String(v)]);
}
if (!plan.length) {
  module.exports = {ok: false, err: '需要 args.values 或 args.map'};
} else {
  const code = String.raw`
var plan = ${JSON.stringify(plan)};
var fields = [].slice.call(document.querySelectorAll('input, textarea')).filter(function (e) {
  return e.getBoundingClientRect().width > 0;
});
function setVal(e, v) {
  var proto = e.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  e.focus();
  setter.call(e, v);
  e.dispatchEvent(new Event('input', {bubbles: true}));
  e.dispatchEvent(new Event('change', {bubbles: true}));
  e.blur();
}
var done = [];
plan.forEach(function (p) {
  var e = fields[p[0]];
  if (!e) { done.push({i: p[0], ok: false, err: '没有第 ' + p[0] + ' 个空格'}); return; }
  setVal(e, p[1]);
  done.push({i: p[0], ok: e.value === p[1], want: p[1], got: e.value});
});
return {total: fields.length, bad: done.filter(function (d) { return !d.ok; }), done: done};
`;
  const raw = await executeInPage(code);
  let out = raw;
  try { out = JSON.parse(raw); } catch (e) {}
  module.exports = out;
}
