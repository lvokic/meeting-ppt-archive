#!/usr/bin/env bash
# 一键部署到 Gitee（码云）+ 准备 Gitee Pages。
# 用法：
#   GITEE_TOKEN=你的私人令牌 GITEE_OWNER=你的用户名 ./deploy-gitee.sh
set -euo pipefail

REPO="meeting-ppt-archive"
: "${GITEE_TOKEN:?请先设置 GITEE_TOKEN（gitee.com 设置→私人令牌，勾选 projects）}"
: "${GITEE_OWNER:?请先设置 GITEE_OWNER（你的 gitee 用户名，即个人主页网址里的那段）}"

echo "▶ 写入仓库 owner 到 index.html…"
sed -i.bak "s/__GITEE_OWNER__/${GITEE_OWNER}/g" index.html && rm -f index.html.bak

echo "▶ 在 Gitee 创建公开仓库（已存在则忽略）…"
curl -s -X POST "https://gitee.com/api/v5/user/repos" \
  -H "Content-Type: application/json" \
  -d "{\"access_token\":\"${GITEE_TOKEN}\",\"name\":\"${REPO}\",\"private\":false,\"auto_init\":false}" \
  -o /tmp/gitee_repo.json -w "  HTTP %{http_code}\n" || true

echo "▶ 提交并推送到 Gitee…"
git add -A
git -c user.email="09055536279n@gmail.com" -c user.name="${GITEE_OWNER}" commit -q -m "deploy: Gitee 版（国内直连，无 Google 依赖）" || true
git branch -M master
git remote remove gitee 2>/dev/null || true
git remote add gitee "https://${GITEE_OWNER}:${GITEE_TOKEN}@gitee.com/${GITEE_OWNER}/${REPO}.git"
git push -u gitee master --force

echo ""
echo "✅ 代码已推到 Gitee：https://gitee.com/${GITEE_OWNER}/${REPO}"
echo ""
echo "最后一步（只能手动点一次）：开启 Gitee Pages"
echo "  1) 打开 https://gitee.com/${GITEE_OWNER}/${REPO}/pages"
echo "  2) 分支选 master，目录 /，点「启动 / 部署」"
echo "  3) 完成后访问： https://${GITEE_OWNER}.gitee.io/${REPO}/"
echo ""
echo "注意：以后你在网页里点添加/删除/编辑，数据走 Gitee API 即时生效，"
echo "      不需要重新部署 Pages。只有改了 index.html 才需要回这里 git push + 重新点一次 Pages 部署。"
