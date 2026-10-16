# pintia-exam

给浏览器助手 Cebian 用的 skill：自动完成 PTA / 拼题A（pintia.cn）题目集与考试里的四类题型。

> 仅用于个人学习与自测，请遵守所在课程与平台的学术规范。

## 覆盖范围

| 题型 | type | 页面形态 | 能做什么 |
| --- | --- | --- | --- |
| 单选题 | 2 | 一页一题 | 选中选项 |
| 填空题 | 4 | 整卷同页 | 填多个输入框，整卷共用一个「保存」 |
| 程序填空题 | 5 | 整卷同页 | 填多个输入框，整卷共用一个「保存」 |
| 编程题 | 7 | 一页一题 | 写入 CodeMirror 6 编辑器、提交本题作答、读评测结果 |

## 安装

整个目录放进 `~/.cebian/skills/pintia-exam/` 即可：

```bash
git clone https://github.com/zzemy/pintia-exam.git ~/.cebian/skills/pintia-exam
```

## 脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/list.js` | 读当前题集：题型导航、题号列表、提交页地址 |
| `scripts/read-blanks.js` | 读填空/程序填空题的全部空格（题号、框前文字、当前值、是否待保存） |
| `scripts/fill-blanks.js` | 按 `{序号: 答案}` 逐框填值并回读校验 |
| `scripts/save.js` | 点整卷的「保存」 |
| `scripts/read-code.js` | 读编程题：题面、样例、编辑器源码 |
| `scripts/fill-code.js` | 整体替换编辑器内容并回读校验 |
| `scripts/submit-code.js` | 点「提交本题作答」，抓「提交结果」弹窗（状态/分数/评测详情） |
| `scripts/submissions.js` | 读提交列表页的提交记录 |

用法（`run_skill`）：

```js
run_skill({ skill: "pintia-exam", script: "scripts/read-blanks.js", tabId });

run_skill({
  skill: "pintia-exam",
  script: "scripts/fill-blanks.js",
  tabId,
  args: { map: { 0: "RightSmall", 1: "Big" } }
});
```

## 已经替你踩掉的坑

- 填空框既没有 `type` 也没有 `data-*`，`input[type="text"]` 一个都匹配不到；值同时写在 DOM 属性 `value` 上。
- 填空题 / 程序填空题**整卷同页、共用一个「保存」按钮**，不点保存答案就丢；提交后状态是「等待评测」，不会立刻出分。
- 编程题页面里样例的输入输出框也是 CodeMirror 6，`document.querySelector('.cm-content')` 会抓到样例框——只有真正可编辑的那个才有 `contenteditable="true"`。
- 直接改 CodeMirror 的 DOM、或用 `execCommand('insertText')` 都无效（内部 state 不同步），必须走 `view.dispatch({changes})`。
- 「提交本题作答」**没有二次确认**，点下去就交；提交后弹「提交结果」需要主动关闭。
- 题型导航里有隐藏的重复节点（`a#tab-*`），按可见性过滤。

完整规则（选择器、URL 格式、常见报错处理）见 `SKILL.md`。
