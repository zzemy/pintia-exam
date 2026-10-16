// PTA：读提交记录（我的提交 / 所有提交表格）。
// args: { navigate: true } 先跳到 /problem-sets/{id}/exam/submissions（题目集 id 从当前 URL 取）。
const a = args || {};
const nav = a.navigate ? String.raw`
var m = location.pathname.match(/\/problem-sets\/(\d+)/);
if (m) {
  location.href = 'https://pintia.cn/problem-sets/' + m[1] + '/exam/submissions';
  await new Promise(function (r) { setTimeout(r, 5000); });
}
` : '';
const code = String.raw`
${nav}
var rows = [].slice.call(document.querySelectorAll('tr')).map(function (r) {
  return (r.innerText || '').replace(/\s+/g, ' ').trim();
}).filter(function (t) {
  return /答案正确|答案错误|部分正确|编译错误|运行超时|内存超限|段错误|格式错误|等待评测|已被覆盖|判题中/.test(t);
});
return {url: location.href, count: rows.length, rows: rows};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
