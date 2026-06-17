# 组会 PPT 存档 · Group Meeting PPT Archive

部署在 GitHub Pages 上的静态网页，用于归档每周组会的演示文稿链接。

- 🔍 按名字 / 日期搜索
- 📄 分页（默认每页 8 条）
- 🗓️ 添加时只能选**周四**日期（过去与未来均可选），按日期从近到远排序
- ➕ 「添加」只填**名字 + 链接**，不需要上传文件
- 👥 全员可更新、即时同步（接 Firebase 后）
- 🧊 Liquid glass 界面，纯白背景

---

## 让「所有人都能添加、即时可见」——一次性配置 Firebase（约 5 分钟）

静态网页没有后端，要让任何访客都能写入且彼此可见，需要一个免费云数据库。
我们用 **Firebase Firestore**。注意：网页里的 `firebaseConfig` 是**公开值，不是密钥**，
安全由数据库规则控制，所以访客**不需要任何令牌或登录**。

1. 打开 <https://console.firebase.google.com> → **添加项目**（名字随意）。
2. 左侧 **构建 → Firestore Database → 创建数据库** → 选「**以生产模式启动**」→ 选区域 → 启用。
3. 进入 **规则** 选项卡，粘贴以下规则并发布（允许任何人读取与新增，但不允许改/删，降低被滥用风险）：

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /meetings/{doc} {
         allow read: if true;
         allow create: if true;
         allow update, delete: if false;
       }
     }
   }
   ```

4. 左侧 **项目设置（齿轮）→ 常规 → 你的应用 → 选 Web `</>`** → 注册应用，
   复制出现的 `firebaseConfig` 对象里的 `apiKey / authDomain / projectId / appId`。
5. 打开本仓库的 `index.html`，找到顶部的 `FIREBASE_CONFIG`，把这几项填进去：

   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIza……",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     appId: "1:……:web:……"
   };
   ```

6. 提交并推送（或运行 `./deploy.sh`）。约 1 分钟后，线上页面即进入**云端共享模式**。

> 没填 `projectId` 时，页面自动进入**本地模式**：功能完全可用，但添加的记录只存在当前浏览器，别人看不到。页面顶部会有黄色提示。

### 想删除某条记录？
规则默认不允许网页端删除。去 Firebase 控制台的 Firestore → `meetings` 集合里删除对应文档即可。
（如需网页端删除，告诉我即可放开。）

---

## 本地预览

直接双击 `index.html`（本地模式，数据存浏览器）。

## 部署 / 更新

```bash
./deploy.sh          # 首次：创建仓库并开启 Pages
# 之后更新：
git add -A && git commit -m "update" && git push
```

线上地址：`https://<你的用户名>.github.io/meeting-ppt-archive/`
