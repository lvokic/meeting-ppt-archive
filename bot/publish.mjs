// 把生成好的本周 PPT：① 提交到 Gitee 仓库 files/（拿永久链接，旧的全保留）
// ② 顺便更新网站 meetings.json ③ 发钉钉群提醒。
//
// 需要环境变量：
//   GITEE_TOKEN       Gitee 私人令牌（写仓库）
//   DINGTALK_TOKEN    钉钉机器人 access_token
//   DINGTALK_SECRET   钉钉机器人加签密钥
//   PPT_PATH/PPT_DATE/PPT_TITLE  由 make_ppt.py 产出（GitHub Actions 自动传入）
// 可选： UPDATE_WEBSITE=0 关闭“同时更新网站”

import crypto from 'node:crypto';
import fs from 'node:fs';

const GITEE = { owner: 'qjw20021227', repo: 'meeting-ppt-archive', branch: 'master' };
const { GITEE_TOKEN, DINGTALK_TOKEN, DINGTALK_SECRET, PPT_PATH, PPT_DATE } = process.env;
const PPT_TITLE = process.env.PPT_TITLE || `${PPT_DATE}-checkin`;
const UPDATE_WEBSITE = process.env.UPDATE_WEBSITE !== '0';

for (const [k, v] of Object.entries({ GITEE_TOKEN, DINGTALK_TOKEN, DINGTALK_SECRET, PPT_PATH, PPT_DATE })) {
  if (!v) { console.error('缺少环境变量：' + k); process.exit(1); }
}

const contentsApi = (p) => `https://gitee.com/api/v5/repos/${GITEE.owner}/${GITEE.repo}/contents/${p}`;

async function giteeGet(path) {
  const res = await fetch(`${contentsApi(path)}?ref=${GITEE.branch}&t=${Date.now()}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`gitee GET ${path} HTTP ${res.status}`);
  return res.json();
}
async function giteeWrite(path, base64, message, sha) {
  const body = { access_token: GITEE_TOKEN, content: base64, message, branch: GITEE.branch };
  if (sha) body.sha = sha;
  const res = await fetch(contentsApi(path), {
    method: sha ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) { let d = 'HTTP ' + res.status; try { d = (await res.json()).message || d; } catch {} throw new Error(`gitee 写入 ${path}：${d}`); }
  return res.json();
}

async function sendDingTalk(text) {
  const ts = Date.now();
  const sign = encodeURIComponent(crypto.createHmac('sha256', DINGTALK_SECRET).update(`${ts}\n${DINGTALK_SECRET}`).digest('base64'));
  const url = `https://oapi.dingtalk.com/robot/send?access_token=${DINGTALK_TOKEN}&timestamp=${ts}&sign=${sign}`;
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msgtype: 'markdown', markdown: { title: '本周组会 PPT', text }, at: { isAtAll: false } }),
  });
  const out = await res.json();
  if (out.errcode !== 0) throw new Error('钉钉返回：' + JSON.stringify(out));
}

async function main() {
  // 1) 上传 pptx 到 files/，得到永久 raw 链接（每周一个新文件，旧的全保留）
  const filePath = `files/${PPT_DATE}-checkin.pptx`;
  const b64 = fs.readFileSync(PPT_PATH).toString('base64');
  const existing = await giteeGet(filePath);              // 同周重跑则覆盖
  await giteeWrite(filePath, b64, `ppt: ${PPT_TITLE}`, existing && existing.sha);
  const rawLink = `https://gitee.com/${GITEE.owner}/${GITEE.repo}/raw/${GITEE.branch}/${filePath}`;
  console.log('✅ PPT 已上传：', rawLink);

  // 2) 更新网站 meetings.json（best-effort，失败不影响发群）
  if (UPDATE_WEBSITE) {
    try {
      const mj = await giteeGet('meetings.json');
      let arr = [], sha = null;
      if (mj) { sha = mj.sha; arr = JSON.parse(Buffer.from(mj.content, 'base64').toString('utf-8') || '[]'); }
      arr = arr.filter((x) => x.date !== PPT_DATE);       // 同日去重
      arr.push({ date: PPT_DATE, name: PPT_TITLE, link: rawLink });
      const nb64 = Buffer.from(JSON.stringify(arr, null, 2) + '\n', 'utf-8').toString('base64');
      await giteeWrite('meetings.json', nb64, `add: ${PPT_TITLE}`, sha);
      console.log('✅ 网站 meetings.json 已更新');
    } catch (e) { console.warn('⚠️ 更新网站失败（已忽略）：', e.message); }
  }

  // 3) 发钉钉群
  const text = [
    '### 📊 本周组会 PPT', '',
    `**日期**：${PPT_DATE}`, '',
    `[${PPT_TITLE}.pptx](${rawLink})`, '',
    '请大家按时参加 🙌',
  ].join('\n');
  await sendDingTalk(text);
  console.log('✅ 已发送到钉钉群');
}

main().catch((e) => { console.error('❌ 失败：', e.message); process.exit(1); });
