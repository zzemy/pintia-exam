# pintia-exam

PTA（pintia.cn，拼题A）题目集与考试中常见题型的自动化作答工具，以 skill 包形式提供：`SKILL.md` 写规则，`scripts/` 放脚本。

## 免责声明

本项目是浏览器自动化方向的个人练习与学习记录，仅适合用于自学、复习自测与前端技术研究。

把它用于任何计入成绩的作业、测验或考试，通常违反所在学校与课程的学术规范，也可能违反平台的服务条款。请在使用前确认自己的行为是否被允许；由此产生的一切后果由使用者自行承担，作者不对任何滥用行为负责。

## 覆盖范围

| 题型 | type | 页面形态 | 支持的操作 |
| --- | --- | --- | --- |
| 单选题 | 2 | 一页一题 | 选中选项 |
| 填空题 | 4 | 整卷同页 | 填写多个输入框，整卷共用一个「保存」 |
| 程序填空题 | 5 | 整卷同页 | 填写多个输入框，整卷共用一个「保存」 |
| 编程题 | 7 | 一页一题 | 写入 CodeMirror 6 编辑器、提交本题作答、读取评测结果 |

## 安装

仓库结构本身就是一个完整的 skill 包（顶层 `SKILL.md` + `scripts/`）。把它整个放进宿主运行的 skills 目录，目录名保持 `pintia-exam` 即可：

```bash
git clone https://github.com/zzemy/pintia-exam.git
```

## 脚本

| 脚本 | 参数 | 作用 |
| --- | --- | --- |
| `scripts/list.js` | 无 | 读取当前题目集：题型导航、题号列表、提交页地址 |
| `scripts/read-blanks.js` | 无 | 读取填空题 / 程序填空题的全部空格：题号、框前文字、当前值、是否待保存 |
| `scripts/fill-blanks.js` | `{ values }` 从第一个空格顺序填；`{ start, values }` 指定起点；`{ map }` 按下标填 | 逐个输入框填值并回读校验 |
| `scripts/save.js` | 无 | 点击整卷的「保存」 |
| `scripts/read-code.js` | 无 | 读取编程题：题面、样例、编辑器源码 |
| `scripts/fill-code.js` | `{ code }` | 整体替换编辑器内容并回读校验 |
| `scripts/submit-code.js` | `{ close }`，默认 `true`（抓完「提交结果」弹窗后自动关闭） | 点击「提交本题作答」，抓取评测结果 |
| `scripts/submissions.js` | `{ navigate }` | 读取提交列表页的提交记录 |

## 实现说明

- 填空框没有 `type` 属性，也没有 `data-*`，`input[type="text"]` 匹配不到任何元素；当前值同时写在 DOM 的 `value` 属性上。
- 填空题与程序填空题整卷同页、共用一个「保存」按钮；不点保存，答案不会提交到服务端。提交后状态为「等待评测」，不立即出分。
- 编程题页面里样例的输入输出框同样是 CodeMirror 6 实例，`document.querySelector('.cm-content')` 会先命中只读的样例框；可编辑的那个才带 `contenteditable="true"`。
- 直接修改 CodeMirror 的 DOM，或使用 `execCommand('insertText')`，都不会同步到编辑器内部状态，页面重渲染后即丢失；应调用 `view.dispatch({changes})`。
- 「提交本题作答」没有二次确认，点击后立即提交；提交完成会弹出「提交结果」对话框，需要主动关闭。
- 题型导航中存在隐藏的重复节点（`a#tab-*`），定位时按可见性过滤。

更完整的规则（URL 格式、选择器、异常处理）见 `SKILL.md`。
