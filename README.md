# 组会 PPT 存档 · Group Meeting PPT Archive

一个部署在 GitHub Pages 上的静态网页，用于归档每周组会的演示文稿。

- 🔍 文件名搜索
- 📄 分页（默认每页 8 条）
- 🗓️ 按文件名日期 `YYYY-M-D` 自动从最近到最晚排序
- ➕ 「添加」按钮：引导你把 PPT 上传到仓库并提交记录，所有人刷新即可看到
- 🧊 Liquid glass 界面，纯白背景

## 数据从哪来

页面渲染的数据来自仓库根目录的 [`meetings.json`](./meetings.json)，格式：

```json
[
  { "file": "2026-6-19-checkin.ppt", "link": "files/2026-6-19-checkin.ppt" }
]
```

- `file`：列表里显示的文件名（建议以日期开头）
- `link`：点击跳转地址。仓库内文件填相对路径（如 `files/xxx.ppt`），也可填外部链接

## 如何添加一次组会

### 方式一：网页上的「添加」按钮（推荐）
1. 点右上角 **添加**
2. 点 **① 上传 PPT 文件到仓库 files/** → 在 GitHub 拖入文件并提交
3. 填写 **文件名** 和 **链接** → 点 **生成并提交**
4. 浏览器会复制好新的 `meetings.json` 内容，并打开它的在线编辑器——全选粘贴、提交即可

### 方式二：直接编辑文件
把 PPT 放进 `files/`，并在 `meetings.json` 里加一行，提交即可。

## 本地预览

直接双击 `index.html` 即可（本地用内置种子数据；线上以 `meetings.json` 为准）。

## 部署

已托管在 GitHub Pages：`main` 分支根目录。每次提交后约 1 分钟自动更新。
