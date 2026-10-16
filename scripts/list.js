// PTA：看清当前题型页有什么。无参数。
// 返回题目集 id、当前题型、题型导航（作答数/题数）、题目卡片列表（id = problemSetProblemId）。
const code = String.raw`
var TYPE = {MULTIPLE_CHOICE: 2, FILL_IN_THE_BLANK: 4, FILL_IN_THE_BLANK_FOR_PROGRAMMING: 5, PROGRAMMING: 7};
var types = [].slice.call(document.querySelectorAll('a[id]')).filter(function (a) {
  return TYPE[a.id] && a.id.indexOf('tab-') !== 0 && a.getBoundingClientRect().width > 0;
}).map(function (a) {
  var t = (a.innerText || '').replace(/\s+/g, ' ').trim();
  var c = t.match(/(\d+)\s*\/\s*(\d+)/);
  return {navId: a.id, type: TYPE[a.id], label: t.split(' ')[0], counts: c ? c[1] + '/' + c[2] : null, href: a.getAttribute('href')};
});
var rows = [].slice.call(document.querySelectorAll('[id]')).filter(function (el) {
  return /^\d{15,}$/.test(el.id) && el.getBoundingClientRect().width > 0;
}).map(function (el) {
  var t = (el.innerText || '').replace(/\s+/g, ' ').trim();
  return {id: el.id, tag: el.tagName, label: (t.match(/^(\d+-\d+)/) || [])[1] || null, text: t.slice(0, 120)};
});
var sid = (location.pathname.match(/\/problem-sets\/(\d+)/) || [])[1] || null;
return {
  url: location.href,
  problemSetId: sid,
  currentType: (location.pathname.match(/type\/(\d+)/) || [])[1] || null,
  submissionsUrl: sid ? 'https://pintia.cn/problem-sets/' + sid + '/exam/submissions' : null,
  types: types,
  rows: rows
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
