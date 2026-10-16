// PTA：把代码写进当前编程题的 CodeMirror 6 编辑器（整体替换）。
// args: { code: "#include <stdio.h>\nint main(){...}" }
// 必须走 view.dispatch({changes})；execCommand('insertText') 只改 DOM，不改 CM 内部 state。
const a = args || {};
if (typeof a.code !== 'string') {
  module.exports = {ok: false, err: '需要 args.code（字符串）'};
} else {
  const code = String.raw`
var ed = document.querySelector('.cm-content[contenteditable="true"]');
var view = ed && ed.cmTile && ed.cmTile.view;
if (!view) return {ok: false, err: '没找到可编辑的 CodeMirror 视图（.cm-content[contenteditable="true"] → cmTile.view）'};
var src = ${JSON.stringify(a.code)};
view.focus();
view.dispatch({changes: {from: 0, to: view.state.doc.length, insert: src}});
await new Promise(function (r) { setTimeout(r, 600); });
var now = view.state.doc.toString();
return {ok: now === src, len: now.length, domLen: (ed.innerText || '').length, head: now.slice(0, 60)};
`;
  const raw = await executeInPage(code);
  let out = raw;
  try { out = JSON.parse(raw); } catch (e) {}
  module.exports = out;
}
