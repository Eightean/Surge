/* Independent subscription panel for Surge; private URLs are never logged. */
const argument = String($argument || '');
const marker = argument.indexOf('&url=');
const settings = marker < 0 ? argument : argument.slice(0, marker);
const args = {};
settings.split('&').forEach(part => {
  const i = part.indexOf('=');
  if (i >= 0) { try { args[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1)); } catch (_) { args[part.slice(0, i)] = part.slice(i + 1); } }
});
args.url = marker < 0 ? '' : argument.slice(marker + 5).trim();
const name = args.title && args.title !== '-' ? args.title : '订阅链接';
const pad = n => String(n).padStart(2, '0');
const now = new Date();
const title = `${name} | ${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
// Separate saved results by subscription and display name; never mix providers.
const cacheKey = 'subscription-panel:last-success:v1:' + encodeURIComponent(JSON.stringify([name, args.url]));
const finish = (content, successful = false) => {
  const panel = {title, content, icon:'externaldrive.fill.badge.icloud', 'icon-color':'#007aff'};
  if (typeof $persistentStore !== 'undefined') {
    try {
      if (successful) {
        $persistentStore.write(JSON.stringify(panel), cacheKey);
      } else {
        const saved = $persistentStore.read(cacheKey);
        const previous = saved ? JSON.parse(saved) : null;
        if (previous && typeof previous.title === 'string' && typeof previous.content === 'string') {
          // Preserve the successful timestamp too; a failed request is not an update.
          $done(previous);
          return;
        }
      }
    } catch (_) {
      // Storage failure must not prevent rendering or expose private URLs.
    }
  }
  $done(panel);
};
if (!/^https?:\/\/\S+$/i.test(args.url)) {
  finish('未配置有效订阅链接，请检查模块参数。');
} else {
  $httpClient.head({url:args.url,headers:{'User-Agent':'Quantumult%20X'}}, (error, response) => {
    if (error || !response || response.status !== 200) return finish('获取失败：请检查网络和订阅链接。');
    const headers = response.headers || {};
    const key = Object.keys(headers).find(k => k.toLowerCase() === 'subscription-userinfo');
    if (!key) return finish('订阅未提供流量信息。');
    const info = {};
    String(headers[key]).split(';').forEach(part => {
      const pair = part.trim().split('=');
      if (pair.length === 2) info[pair[0]] = Number(pair[1]);
    });
    if (![info.upload,info.download,info.total].every(n => Number.isFinite(n) && n >= 0)) return finish('订阅返回的流量信息无效。');
    const lines = [`用量：${bytes(info.upload+info.download)} | ${bytes(info.total)}`];
    const resetValue = String(args.reset_day || '').trim();
    const resetLeft = remainingResetDays(resetValue, now);
    if (resetValue === '长期' || resetValue === '长期有效') {
      lines.push('重置时间：长期有效');
    } else if (resetLeft !== null) {
      lines.push(`重置时间：剩余${resetLeft}天`);
    }
    if (!Object.prototype.hasOwnProperty.call(info, 'expire')) {
      lines.push('到期时间：未提供');
    } else if (info.expire === 0) {
      // Empty expire= and expire=0 are treated as no time limit.
      lines.push('到期时间：长期有效');
    } else if (Number.isFinite(info.expire) && info.expire > 0) {
      const d = new Date(info.expire*1000);
      lines.push(Number.isNaN(d.getTime()) ? '到期时间：未知' : `到期时间：${d.getFullYear()} 年 ${pad(d.getMonth()+1)} 月 ${pad(d.getDate())} 日`);
    } else {
      lines.push('到期时间：未知');
    }
    finish(lines.join('\n'), true);
  });
}
function bytes(n) {
  if (n === 0) return '0B';
  const units = ['B','KB','MB','GB','TB','PB','EB'];
  const i = Math.min(Math.floor(Math.log(n)/Math.log(1024)),units.length-1);
  return (n/Math.pow(1024,i)).toFixed(2)+' '+units[i];
}

// Calendar-day countdown. A reset day beyond this month's length uses its last day.
function remainingResetDays(value, today) {
  if (!/^\d{1,2}$/.test(String(value || ''))) return null;
  const day = Number(value);
  if (day < 1 || day > 31) return null;
  const year = today.getFullYear(), month = today.getMonth();
  const ordinal = (y, m, d) => Date.UTC(y, m, d) / 86400000;
  const clamped = (y, m) => Math.min(day, new Date(y, m + 1, 0).getDate());
  let y = year, m = month, d = clamped(y, m);
  if (today.getDate() >= d) {
    m += 1;
    if (m === 12) { m = 0; y += 1; }
    d = clamped(y, m);
  }
  return ordinal(y, m, d) - ordinal(year, month, today.getDate());
}
