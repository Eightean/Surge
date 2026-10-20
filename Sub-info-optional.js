/* Optional subscription panel for Surge. No private subscription URLs. */
const params = {};
String($argument || '').split(/&(?=(?:title_[12]|url_[12])=)/).forEach(part => {
  const i = part.indexOf('=');
  if (i < 0) return;
  const key = part.slice(0, i);
  let value = part.slice(i + 1).trim();
  // Raw URLs preserve their own percent escapes. Fully encoded URLs are also accepted.
  if (/^https?%3a/i.test(value)) {
    try { value = decodeURIComponent(value); } catch (_) {}
  }
  params[key] = value === '-' ? '' : value;
});
const slots = [1, 2].map(i => ({
  title: params['title_' + i] || '订阅链接 ' + i,
  url: params['url_' + i] || ''
})).filter(slot => slot.url);

(async () => {
  const blocks = await Promise.all(slots.map(loadSubscription));
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  $done({
    title: `机场流量信息 | ${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    content: blocks.length ? blocks.join('\n\n') : '请在 Edit Arguments 中填写至少一个订阅链接。',
    icon: 'externaldrive.fill.badge.icloud',
    'icon-color': '#007aff'
  });
})();

async function loadSubscription(slot) {
  if (!/^https?:\/\/\S+$/i.test(slot.url)) return slot.title + '\n链接格式不正确，请填写完整的 http(s) 地址。';
  try {
    const header = await new Promise((resolve, reject) => {
      $httpClient.head({url: slot.url, headers: {'User-Agent': 'Quantumult%20X'}}, (err, resp) => {
        if (err || !resp || resp.status !== 200) return reject(new Error('request failed'));
        const key = Object.keys(resp.headers || {}).find(k => k.toLowerCase() === 'subscription-userinfo');
        if (!key) return reject(new Error('missing usage header'));
        resolve(resp.headers[key]);
      });
    });
    const info = {};
    String(header).split(';').forEach(part => {
      const pair = part.trim().split('=');
      if (pair.length === 2) info[pair[0]] = Number(pair[1]);
    });
    if (![info.upload, info.download, info.total].every(Number.isFinite) || info.upload < 0 || info.download < 0 || info.total < 0) throw new Error('invalid usage');
    const content = [slot.title, `用量：${formatBytes(info.upload + info.download)} | ${formatBytes(info.total)}`];
    if (Number.isFinite(info.expire) && info.expire > 0) {
      const date = new Date(info.expire * 1000);
      if (!Number.isNaN(date.getTime())) content.push(`到期：${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`);
    }
    return content.join('\n');
  } catch (_) {
    // Never log request objects or private subscription URLs.
    return slot.title + '\n获取失败：请检查订阅链接、网络或订阅是否提供流量信息。';
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
}
