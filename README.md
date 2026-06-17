# 组会 PPT 存档 · Group Meeting PPT Archive

一个**纯静态、国内可直连**的网页，归档每周组会的演示文稿链接。
托管在 **Gitee Pages（码云）**，数据存仓库里的 `meetings.json`，读写走 **Gitee API**。
**不依赖任何 Google 服务**（无 Google 字体、无 Firebase），大陆手机不挂梯子也能秒开。

- 🔍 按名字 / 日期搜索
- 📄 分页（每页 8 条）
- 🗓️ 添加时只选**周四**日期（过去 / 未来均可），按日期从近到远排序
- 👀 访客**只读**，打开即看（无需登录、无需令牌）
- 🛠️ 你（维护者）点「管理」→ 填一次 Gitee 令牌 → 可**添加 / 编辑 / 删除**
- 🧊 Liquid glass 界面，纯白背景

## 工作原理

- 访客打开页面 → 浏览器直接从 `https://gitee.com/api/v5/...contents/meetings.json` 读取列表（公开，免令牌）。
- 你在「管理模式」下添加/改/删 → 浏览器用你的 Gitee 私人令牌，通过同一个 API 把 `meetings.json` 提交回仓库 → 国内访客刷新即可看到。
- 令牌只存在**你自己浏览器的 localStorage**，不会上传、不进代码。

---

## 首次部署（约 10 分钟）

### 1. 注册 Gitee 并实名
- 注册 <https://gitee.com>，完成**实名认证**（Gitee Pages 要求实名，国内身份很快）。

### 2. 生成私人令牌
- 打开 <https://gitee.com/profile/personal_access_tokens> → 生成新令牌 → 勾选 **projects** 权限 → 复制保存。

### 3. 推送代码（二选一）

**A. 用脚本（推荐）** —— 在本项目目录运行：
```bash
GITEE_TOKEN=你的令牌 GITEE_OWNER=你的gitee用户名 ./deploy-gitee.sh
```

**B. 手动** —— 把 `index.html` 顶部 `GITEE.owner` 的 `__GITEE_OWNER__` 改成你的用户名，然后：
```bash
git add -A && git commit -m deploy && git branch -M master
git remote add gitee https://gitee.com/你的用户名/meeting-ppt-archive.git
git push -u gitee master
```
（首次需在 Gitee 网页新建同名公开仓库，或用脚本自动建。）

### 4. 开启 Gitee Pages（手动一次）
- 打开 `https://gitee.com/你的用户名/meeting-ppt-archive/pages`
- 分支 `master`、目录 `/` → 点**启动 / 部署**
- 完成后访问：`https://你的用户名.gitee.io/meeting-ppt-archive/`

---

## 日常使用

- **加 / 改 / 删一条**：网页右上「管理」→（首次粘贴令牌）→ 在列表里操作。数据即时生效，**无需重新部署 Pages**。
- **改了页面样式/代码**：`git push gitee master` 后，回 Pages 页面再点一次**更新部署**（Gitee Pages 免费版不会自动重建）。

## 关于链接
本站只存链接、不存文件。链接必须是**完整网址**（`http://` / `https://` 开头），
指向 PPT 实际所在处（飞书 / OneDrive / 坚果云 等）。否则点开会 404。

---

## 钉钉群定时提醒（替代飞书「数据准备小秘书」）

每周四自动：用模板生成带本周日期的 PPT → 提交到 Gitee 仓库 `files/`（**永久链接、旧的全部保留**）
→ 更新网站 `meetings.json` → 发钉钉群。无需服务器、无需钉钉企业凭证，用 GitHub Actions 免费定时。

- `bot/make_ppt.py`：用 `bot/template.pptx` 生成，替换占位符 `{{DATE}}`、`{{TITLE}}`
- `bot/publish.mjs`：上传 Gitee + 更新网站 + 发钉钉
- `.github/workflows/dingtalk-weekly.yml`：每周四 09:00（北京时间）触发，带手动按钮

### 配置步骤
1. **放模板**：把你的 PPT 模板放到 `bot/template.pptx`，在要填日期的文本框里写占位符
   `{{TITLE}}`（→ `2026.06.25-checkin`）或 `{{DATE}}`（→ `2026-06-25`）。提交推送。
2. **建钉钉机器人**：群设置 → 智能群助手 → 添加机器人 → **自定义** → 安全设置选 **加签** →
   拿到 **Webhook** 里 `access_token=` 后那段，和 **加签密钥**（`SEC` 开头）。
3. **填 GitHub Secrets**：仓库 `lvokic/meeting-ppt-archive` → Settings → Secrets and variables → Actions → New repository secret：
   - `DINGTALK_TOKEN`、`DINGTALK_SECRET`、`GITEE_TOKEN`（Gitee 私人令牌，用来写仓库）
4. **测试**：Actions 标签页 → 「钉钉组会提醒」→ **Run workflow**，群里应收到本周 PPT，网站也多一条。
5. **改时间**：编辑 workflow 里的 cron（`0 1 * * 4` = 周四 09:00 北京，UTC+8）。

> PPT 每周一个新文件存在仓库 `files/` 下，链接形如
> `https://gitee.com/qjw20021227/meeting-ppt-archive/raw/master/files/2026-06-25-checkin.pptx`，
> 永久有效、旧的不受影响。点开是下载 `.pptx`。
