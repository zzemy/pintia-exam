// PTA：读填空题 / 程序填空题当前页的全部空格（顺序 = DOM 顺序，跨题连续编号）+ 每题题面。
// 无参数。拿到答案后用 fill-blanks.js 按 i 下标填。
const code = String.raw`
function pidOf(e) {
  var p = e;
  while (p) { if (p.id && /^\d{15,}$/.test(p.id)) return p.id; p = p.parentElement; }
  return null;
}
var fields = [].slice.call(document.querySelectorAll('input, textarea')).filter(function (e) {
  return e.getBoundingClientRect().width > 0;
});
function sideText(e, dir, n) {
  var out = '', node = e, guard = 0;
  while (node && out.length < n && guard++ < 30) {
    var sib = dir < 0 ? node.previousSibling : node.nextSibling;
    if (sib) {
      out = dir < 0 ? ((sib.textContent || '') + out) : (out + (sib.textContent || ''));
      node = sib;
    } else if (node.parentElement) {
      node = node.parentElement;
    } else break;
  }
  out = out.replace(/\s+/g, ' ').trim();
  return dir < 0 ? out.slice(-n) : out.slice(0, n);
}
var blanks = fields.map(function (e, i) {
  var p = e, line = '', score = '';
  for (var k = 0; k < 7 && p; k++) {
    p = p.parentElement;
    if (!p) break;
    var t = (p.innerText || '').replace(/\s+/g, ' ').trim();
    if (!score && /^\d+(\.\d+)?\s*分$/.test(t)) score = t;
    if (t.length > 12) { line = t; break; }
  }
  return {i: i, tag: e.tagName, value: e.value, problemId: pidOf(e), score: score,
          before: sideText(e, -1, 60), after: sideText(e, 1, 24), line: line.slice(0, 140)};
});
var cards = [].slice.call(document.querySelectorAll('[id]')).filter(function (el) {
  return /^\d{15,}$/.test(el.id) && el.getBoundingClientRect().width > 0;
}).map(function (el) {
  var t = (el.innerText || '').replace(/[ \t]+/g, ' ').trim();
  return {id: el.id, label: (t.match(/^(\d+-\d+)/) || [])[1] || null, text: t.slice(0, 700)};
});
var pending = (document.body.innerText.match(/\d+\s*题答案待保存/) || [])[0] || null;
return {url: location.href, total: blanks.length, pendingSave: pending, blanks: blanks, cards: cards};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
