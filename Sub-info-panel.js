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
const finish = content => $done({title, content, icon:'externaldrive.fill.badge.icloud', 'icon-color':'#007aff'});
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
    if (!Object.prototype.hasOwnProperty.call(info, 'expire')) {
      lines.push('到期：未提供');
    } else if (info.expire === 0) {
      // Empty expire= and expire=0 are treated as no time limit.
      lines.push('到期：长期有效');
    } else if (Number.isFinite(info.expire) && info.expire > 0) {
      const d = new Date(info.expire*1000);
      lines.push(Number.isNaN(d.getTime()) ? '到期：未知' : `到期：${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`);
    } else {
      lines.push('到期：未知');
    }
    finish(lines.join('\n'));
  });
}
function bytes(n) {
  if (n === 0) return '0B';
  const units = ['B','KB','MB','GB','TB','PB','EB'];
  const i = Math.min(Math.floor(Math.log(n)/Math.log(1024)),units.length-1);
  return (n/Math.pow(1024,i)).toFixed(2)+' '+units[i];
}
