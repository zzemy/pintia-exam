// PTA：读当前编程题（题面 / 样例 / 编辑器源码 / 按钮文案）。无参数。
// ⚠️ 样例输入输出也是 CodeMirror 实例，但只读；可编辑的那个才是代码区。
const code = String.raw`
var ed = document.querySelector('.cm-content[contenteditable="true"]');
var view = ed && ed.cmTile && ed.cmTile.view;
var samples = [].slice.call(document.querySelectorAll('.cm-content[contenteditable="false"]')).map(function (e) {
  var v = e.cmTile && e.cmTile.view;
  var box = e.closest('.cm-editor');
  var m = box ? (box.innerText || '').match(/\[\s*(in|out)\s*\]/i) : null;
  return {label: m ? m[1].toLowerCase() : null, text: v ? v.state.doc.toString() : ''};
});
var btns = [].slice.call(document.querySelectorAll('button')).filter(function (b) {
  return b.getBoundingClientRect().width > 0;
}).map(function (b) {
  return (b.innerText || '').replace(/\s+/g, ' ').trim();
}).filter(function (t) { return t && t.length < 24; });
var main = document.querySelector('main');
return {
  url: location.href,
  title: (document.title || '').split(' - ')[0],
  statement: main ? main.innerText.replace(/\n{2,}/g, '\n').slice(0, 1500) : null,
  samples: samples,
  editor: {editable: !!ed, len: view ? view.state.doc.length : null, code: view ? view.state.doc.toString() : null},
  buttons: btns
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
