import type { Celebrity, CelebrityRaw, Series, SeriesMeta } from '@/api/types'

/**
 * 演员表归一化。接口给的字段名是中文(演员/角色/头像/简介), 这里转成英文键,
 * 顺便丢掉没有姓名的脏数据 —— 详情页靠 name 渲染, 空名字会画出一个空位。
 */
export function parseCelebrities(raw: CelebrityRaw[] | undefined): Celebrity[] {
  if (!Array.isArray(raw)) return []
  const out: Celebrity[] = []
  for (const item of raw) {
    const name = typeof item?.演员 === 'string' ? item.演员.trim() : ''
    if (!name) continue
    out.push({
      name,
      role: typeof item.角色 === 'string' ? item.角色.trim() : '',
      avatar: typeof item.头像 === 'string' ? item.头像 : '',
      bio: typeof item.简介 === 'string' ? item.简介.trim() : '',
    })
  }
  return out
}

/** /episodes 返回的是 meta(分类是数组), 收藏/历史存的是列表项形状, 这里做一次对齐。 */
export function metaToSeries(meta: SeriesMeta): Series {
  return {
    series_id: meta.series_id,
    title: meta.title,
    cover: meta.cover,
    episode_cnt: meta.episode_cnt,
    score: '',
    play_cnt: meta.play_cnt,
    category: meta.category.join(' / '),
    intro: meta.intro,
  }
}

/** 收藏/历史条目比列表项少几个字段, 补默认值后复用同一张卡片。 */
export function libraryToSeries(item: {
  series_id: string
  title: string
  cover: string
  episode_cnt: number
}): Series {
  return {
    series_id: item.series_id,
    title: item.title,
    cover: item.cover,
    episode_cnt: item.episode_cnt,
    score: '',
    play_cnt: 0,
  }
}
