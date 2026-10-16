---
name: pintia-exam
description: PTA（pintia.cn / 拼题A）题目集中的自动作答：程序填空题与填空题逐空填写并保存、编程题写入 CodeMirror 代码编辑器、提交并抓取评测结果、核对提交记录。当用户在 pintia.cn 的题目集/考试页要求「填答案」「写代码」「提交」「看评测结果」时使用。
version: 1.0.0
metadata:
  permissions:
    - page.executeJs
---

# PTA 题目集自动作答

> 免责声明：本项目仅供个人学习、复习与技术研究使用；用于计入成绩的作业或考试通常违反学术规范，由此产生的一切后果由使用者自负。

覆盖 pintia.cn「题目集 / 考试（exam）」下的四类题型：单选题、填空题、程序填空题、编程题。把「看清页面 → 填答 → 保存/提交 → 核对」这条链路固化下来。

## 0. 前提与定位

- 需要一个**已登录**的 pintia.cn 标签页。
- 题目集 id 从 URL 取：`https://pintia.cn/problem-sets/{problemSetId}/exam/problems/type/{N}`。
- `N`：`2`=单选题、`4`=填空题、`5`=程序填空题、`7`=编程题，与左侧导航 id 对应：
  `a#MULTIPLE_CHOICE` / `a#FILL_IN_THE_BLANK` / `a#FILL_IN_THE_BLANK_FOR_PROGRAMMING` / `a#PROGRAMMING`
  （页面上还有一份 `a#tab-*` 的隐藏副本，按**可见性**过滤）。

⚠️ 两类页面形态完全不同，操作方式也不同：

| 题型 | 形态 | 作答方式 |
|---|---|---|
| 填空题 / 程序填空题 | **整页把该题型所有题铺在一起**，每题一个卡片（卡片 `id` == `problemSetProblemId`） | 题面里**内嵌 input / textarea**，页面底部**一个**「保存」 |
| 编程题 | **一次一题**，有「上一题 / 下一题」 | 代码写在 **CodeMirror 6** 里，右下角「提交本题作答」 |

## 1. 先看清当前页

```
run_skill skill=pintia-exam script=scripts/list.js tabId=<PTA标签页>
```

返回：`problemSetId`、当前题型、题型导航（各题型 `作答数/题数`）、题目卡片列表（`id` = `problemSetProblemId`、标号、文本片段）。

## 2. 填空题 / 程序填空题

1. 读空格：

   ```
   run_skill skill=pintia-exam script=scripts/read-blanks.js tabId=<PTA标签页>
   ```

   返回全部空格的**顺序**（= 页面 DOM 顺序，跨题目连续编号）、当前值、所在行代码片段、所属题目 id、分值徽标；同时给出每题卡片正文（题面 + 代码）。

2. 自行推出每空答案。注意「所在行代码」是判断这一空填什么的关键：PTA 是把源码挖掉一小段变成输入框，**框前面的固定代码不算答案的一部分**（例：`if ( first == [1] ){` 这一空要填的就是 `1`，不是 `first == 1`）。

3. 填：

   ```
   run_skill skill=pintia-exam script=scripts/fill-blanks.js tabId=<PTA标签页> args={"values":["1","first = 0","putchar('-')"]}
   ```

   也支持 `args={"start":9,"values":[...]}`、`args={"map":{"0":"1","3":"x"}}`。填完回读 `value` 逐个核对。

4. **必须保存**：

   ```
   run_skill skill=pintia-exam script=scripts/save.js tabId=<PTA标签页>
   ```

   页面底部挂着「N 题答案待保存」时说明还没存；`save.js` 会点「保存」并回读该提示是否消失。

这类题由后台/老师批阅，提交后状态是「等待评测」，**不会立刻出分**。

## 3. 编程题

1. 读题：

   ```
   run_skill skill=pintia-exam script=scripts/read-code.js tabId=<PTA标签页>
   ```

   返回题面、样例（in / out，注意**样例框也是 CodeMirror，但是只读的**）、当前编辑器源码、按钮文案。

2. 写代码：

   ```
   run_skill skill=pintia-exam script=scripts/fill-code.js tabId=<PTA标签页> args={"code":"#include <stdio.h>\n..."}
   ```

   走 CodeMirror 的 `view.dispatch({changes})`，**不是**改 DOM。

3. 复查：再跑一次 `read-code.js` 看 `editor.code`（切题或刷新后仍在 = 草稿已落到平台）。

4. 提交（**有副作用，确认要交再跑**）：

   ```
   run_skill skill=pintia-exam script=scripts/submit-code.js tabId=<PTA标签页>
   ```

   点「提交本题作答」→ 等「提交结果」弹窗 → 抓 状态 / 分数 / 评测详情 → 关弹窗。
   ⚠️ **没有二次确认**，点了就真提交；PTA 即时评测，通常几十毫秒就出结果。

## 4. 核对提交记录

```
run_skill skill=pintia-exam script=scripts/submissions.js tabId=<PTA标签页> args={"navigate":true}
```

`navigate:true` 会先跳到 `https://pintia.cn/problem-sets/{problemSetId}/exam/submissions`（也可在侧栏点「提交列表」）。返回每行「提交时间 / 状态 / 分数 / 题目」。
见过的状态：`答案正确`、`答案错误`、`部分正确`、`编译错误`、`运行超时`、`内存超限`、`段错误`、`等待评测`、`已被覆盖`。

## 关键事实速查

| 事项 | 结论 |
|---|---|
| 题型 id | 2 单选 / 4 填空 / 5 程序填空 / 7 编程 |
| 题目卡片 / 行 | 容器 `id` == `problemSetProblemId`（CSS 里首位数字要转义，如 `#\32 110…`） |
| 题目链接 | `/problem-sets/{id}/exam/problems/type/{N}?problemSetProblemId={pid}` |
| 空格元素 | `input, textarea`——**没有 `type` 属性、没有 `data-*`**，只有 `class` / `value` / `style` |
| 空格分值 | 空格最近祖先文本形如「1 分」 |
| 底部保存 | 文案恰为「保存」的可见 `button`（一页只有一个） |
| 代码编辑器 | `.cm-content[contenteditable="true"]`，CM 视图 = `el.cmTile.view` |
| 样例框 | 也是 `.cm-editor`，但 `.cm-content[contenteditable="false"]` |
| 编程题提交 | 文案恰为「提交本题作答」的可见 `button`，点了立即提交 |
| 结果弹窗 | `.pc-modal[data-e2e="modal-mask"]`，正文含 题目 / 提交时间 / 编译器 / 状态 / 分数 / 评测详情；关闭用 `[data-e2e="modal-close-btn"]` 或文案「确认」 |
| 侧栏 | 概览 / 题目列表 / 提交列表 / 排名 |

选择器会随版本变：脚本一律**按文案或 `contenteditable` 定位**，不硬套 `nth-of-type` 长路径；要点击时先用 `inspect` 重新发现。

## 实现要点

- **React 受控输入**：直接赋值 `el.value` 不会同步到答题状态；需用原生 setter 赋值并派发 `input` / `change`，再 `focus()` → `blur()` 触发 `focusout`（`fill-blanks.js` 已处理）。
- **CodeMirror 6 的 `execCommand('insertText')` 不会同步视图状态**：它只改 DOM 文本，`view.state` 不变，页面重渲染即丢失。应调用 `view.dispatch({changes:{from:0,to:doc.length,insert:code}})`。
- **`document.querySelector('.cm-content')` 命中的是只读样例框**；可编辑的实例带 `contenteditable="true"`，其视图对象挂在 `el.cmTile.view`。
- 填空题与程序填空题**整卷共用一个「保存」**：只填不保存，答案不会提交到服务端。
- 「提交本题作答」**没有二次确认**；查看历史提交用「查看上次提交」，点击前先用 `read-code.js` 的 `buttons` 确认按钮文案。
- 提交列表中，填空题与程序填空题是**整份一条记录**，不是每空一条。
- 选择器避免使用 `input[type="text"]`：PTA 的输入框没有 `type` 属性。

## 维护说明

- 脚本用 `module.exports = <值>` 返回结果，内部可以使用顶层 `await`。
- `executeInPage(code)` 把注入代码作为 **async 函数体**执行：必须用**顶层 `return`**；写成 `(() => { return x })()` 只会得到 `(no return value)`。
- `executeInPage` 的返回值是**字符串**（对象被 JSON 序列化），脚本内统一 `let out = raw; try { out = JSON.parse(raw) } catch (e) {}`。
- 注入代码用 `String.raw` 模板编写（反斜杠不被模板字面量转义），插值用 `${JSON.stringify(x)}`。
- 权限需写在 front matter 的 `metadata.permissions` 下（`page.executeJs` 才会提供 `executeInPage`）；写在外层 `permissions:` 不生效。
- 除 `submit-code.js` 外，其余脚本都是只读或幂等的，可重复执行。
