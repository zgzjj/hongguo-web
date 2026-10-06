/** 展示层格式化。所有输入都按接口实测类型处理。 */

function stripTrailingZero(value: number): string {
  const text = value.toFixed(1)
  return text.endsWith('.0') ? text.slice(0, -2) : text
}

/** 播放量 → "99万热度" / "1.2亿热度" / "975热度" */
export function formatHeat(playCnt: number | undefined): string {
  if (!playCnt || !Number.isFinite(playCnt) || playCnt <= 0) return ''
  if (playCnt >= 1e8) return `${stripTrailingZero(playCnt / 1e8)}亿热度`
  if (playCnt >= 1e4) return `${stripTrailingZero(playCnt / 1e4)}万热度`
  return `${playCnt}热度`
}

/** 评分是字符串, 这里统一转数字; 非法值返回 null */
export function parseScore(score: string | undefined): number | null {
  if (!score) return null
  const value = Number(score)
  return Number.isFinite(value) ? value : null
}

/** 秒 → "02:14"; 超过一小时 → "1:02:14" */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '--:--'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** 分类是斜杠分隔的字符串, 拆成标签数组 */
export function splitCategory(category: string | undefined, max = 2): string[] {
  if (!category) return []
  return category
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, max)
}

/** Unix 秒 → "2026-03-25" */
export function formatDate(unixSeconds: number | undefined): string {
  if (!unixSeconds) return ''
  const date = new Date(unixSeconds * 1000)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 集数文案: 81 → "全81集" */
export function formatEpisodeCount(count: number | undefined): string {
  return count ? `全${count}集` : ''
}

/** 毫秒时间戳 → "刚刚" / "12 分钟前" / "3 小时前" / "2 天前" / "2026-03-25" */
export function formatRelative(ms: number | undefined): string {
  if (!ms) return ''
  const diff = Date.now() - ms
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return formatDate(Math.floor(ms / 1000))
}
