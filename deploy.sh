#!/usr/bin/env bash
# 一键部署到 GitHub Pages。运行前请先： gh auth login -h github.com -w
set -euo pipefail

REPO_NAME="meeting-ppt-archive"
BRANCH="main"

echo "▶ 检查 GitHub 登录…"
gh auth status >/dev/null 2>&1 || { echo "✗ 未登录，请先运行: gh auth login -h github.com -w"; exit 1; }

OWNER="$(gh api user --jq .login)"
echo "▶ GitHub 账号: $OWNER"

# 把页面里的 __OWNER__ 占位替换成真实用户名
echo "▶ 写入仓库信息到 index.html…"
sed -i.bak "s/__OWNER__/$OWNER/g" index.html && rm -f index.html.bak

git add -A
git commit -q -m "chore: 配置仓库 owner=$OWNER" || true
git branch -M "$BRANCH"

# 创建远程仓库（若已存在则跳过）并推送
if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "▶ 仓库已存在，直接推送…"
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  git push -u origin "$BRANCH"
else
  echo "▶ 创建公开仓库并推送…"
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
fi

# 开启 GitHub Pages（main 分支根目录）
echo "▶ 开启 GitHub Pages…"
gh api -X POST "repos/$OWNER/$REPO_NAME/pages" \
  -f "source[branch]=$BRANCH" -f "source[path]=/" >/dev/null 2>&1 || \
gh api -X PUT "repos/$OWNER/$REPO_NAME/pages" \
  -f "source[branch]=$BRANCH" -f "source[path]=/" >/dev/null 2>&1 || true

echo ""
echo "✅ 部署完成！"
echo "   网址（约 1 分钟后生效）: https://$OWNER.github.io/$REPO_NAME/"
echo "   仓库: https://github.com/$OWNER/$REPO_NAME"
