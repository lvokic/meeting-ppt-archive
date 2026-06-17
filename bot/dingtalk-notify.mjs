// 钉钉群机器人：把一个【固定的 PPT 链接】发到群里（每周定时）。
// 用法：每周把新 PPT 覆盖上传到钉盘的同一个文件（分享链接不变），机器人定时发这个固定链接即可。
//
// 必填环境变量（机器人凭证，建议放 GitHub Secrets / 不要写进代码）：
//   DINGTALK_TOKEN   钉钉自定义机器人 webhook 里 access_token= 后面那段
//   DINGTALK_SECRET  机器人“加签”模式给的密钥（以 SEC 开头）
//
// PPT 链接与文案：改下面的 CONFIG 即可（也可用环境变量 PPT_LINK / PPT_TITLE 覆盖）。
//
// 本地测试： DINGTALK_TOKEN=xxx DINGTALK_SECRET=SECxxx node bot/dingtalk-notify.mjs

import crypto from 'node:crypto';

/* ============== 这里改成你的固定 PPT 链接和文案 ============== */
const CONFIG = {
  pptLink: 'https://替换成你的钉盘固定分享链接',
  pptTitle: '本周组会 checkin.pptx',
  note: '请大家按时参加 🙌',
  atAll: false,            // 是否 @所有人
};
/* =========================================================== */

const TOKEN = process.env.DINGTALK_TOKEN;
const SECRET = process.env.DINGTALK_SECRET;
const pptLink = process.env.PPT_LINK || CONFIG.pptLink;
const pptTitle = process.env.PPT_TITLE || CONFIG.pptTitle;

if (!TOKEN || !SECRET) {
  console.error('缺少 DINGTALK_TOKEN 或 DINGTALK_SECRET 环境变量');
  process.exit(1);
}
if (!pptLink || pptLink.includes('替换成')) {
  console.error('请先在 CONFIG.pptLink（或 PPT_LINK 环境变量）填入固定的钉盘分享链接');
  process.exit(1);
}

async function sendDingTalk(markdown, title) {
  const timestamp = Date.now();
  const stringToSign = `${timestamp}\n${SECRET}`;
  const sign = encodeURIComponent(crypto.createHmac('sha256', SECRET).update(stringToSign).digest('base64'));
  const url = `https://oapi.dingtalk.com/robot/send?access_token=${TOKEN}&timestamp=${timestamp}&sign=${sign}`;
  const body = {
    msgtype: 'markdown',
    markdown: { title, text: markdown },
    at: { isAtAll: CONFIG.atAll },
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const out = await res.json();
  if (out.errcode !== 0) throw new Error('钉钉返回错误：' + JSON.stringify(out));
  return out;
}

async function main() {
  const text = [
    '### 📊 本周组会 PPT',
    '',
    `[${pptTitle}](${pptLink})`,
    '',
    CONFIG.note,
  ].join('\n');

  const out = await sendDingTalk(text, '本周组会 PPT');
  console.log('✅ 已发送到钉钉群：', pptTitle, '|', JSON.stringify(out));
}

main().catch((e) => { console.error('❌ 失败：', e.message); process.exit(1); });
