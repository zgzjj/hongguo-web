import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getFilters } from '@/api/endpoints'
import { API_BASE, getApiKey, setApiKey } from '@/api/client'
import { BROWSE_LIMIT } from '@/api/types'
import { Icon } from '@/components/ui/Icon'
import { PageHead } from '@/components/ui/PageHead'
import { errorMessage } from '@/lib/error'
import { useLibraryActions } from '@/features/library/useLibrary'
import './settings.css'

type ProbeState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'ok'; detail: string }
  | { kind: 'fail'; detail: string }

function maskKey(key: string): string {
  if (!key) return '未设置'
  if (key.length <= 6) return '•'.repeat(key.length)
  return `${key.slice(0, 3)}${'•'.repeat(6)}${key.slice(-3)}`
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { clearAll } = useLibraryActions()

  const [key, setKey] = useState(() => getApiKey())
  const [saved, setSaved] = useState(false)
  const [probe, setProbe] = useState<ProbeState>({ kind: 'idle' })
  const [confirmClear, setConfirmClear] = useState(false)

  function save(event: FormEvent) {
    event.preventDefault()
    setApiKey(key.trim())
    setSaved(true)
    setProbe({ kind: 'idle' })
    // 换了密钥, 之前失败/成功的缓存都不作数了
    void queryClient.invalidateQueries()
  }

  async function test() {
    setProbe({ kind: 'running' })
    try {
      const res = await getFilters('short_play')
      setProbe({ kind: 'ok', detail: `已连通，返回 ${res.rows.length} 组筛选项` })
    } catch (error) {
      setProbe({ kind: 'fail', detail: errorMessage(error) })
    }
  }

  function clear() {
    clearAll()
    setConfirmClear(false)
  }

  return (
    <div className="settings">
      <PageHead title="设置" sub="密钥与本地数据都只保存在这台设备的浏览器里" />

      <section className="settings__card">
        <h2 className="settings__card-title">API Key</h2>
        <p className="settings__card-hint">
          后端要求所有接口带 <code>api_key</code>。也可以在网址后面加 <code>?api_key=xxx</code> 直接带上，
          首次访问会自动存下来。
        </p>

        <form className="settings__form" onSubmit={save}>
          <input
            className="settings__input"
            type="text"
            value={key}
            onChange={(event) => {
              setKey(event.target.value)
              setSaved(false)
            }}
            placeholder="devkey123"
            aria-label="API Key"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="settings__save">
            保存
          </button>
        </form>

        <div className="settings__row">
          <span className="settings__row-label">当前生效</span>
          <span className="settings__row-value">{maskKey(getApiKey())}</span>
        </div>

        <div className="settings__row">
          <span className="settings__row-label">接口地址</span>
          <span className="settings__row-value">
            {API_BASE || '同源根路径'}
            <span className="settings__row-note">
              {API_BASE ? '（开发模式走 Vite 代理）' : '（生产构建）'}
            </span>
          </span>
        </div>

        <div className="settings__actions">
          <button type="button" className="settings__test" onClick={() => void test()} disabled={probe.kind === 'running'}>
            {probe.kind === 'running' ? (
              <Icon name="spinner" size={15} className="settings__spin" />
            ) : (
              <Icon name="refresh" size={15} />
            )}
            测试连接
          </button>

          {probe.kind === 'ok' ? <span className="settings__probe is-ok">{probe.detail}</span> : null}
          {probe.kind === 'fail' ? <span className="settings__probe is-fail">{probe.detail}</span> : null}
          {saved ? <span className="settings__probe is-ok">密钥已保存</span> : null}
        </div>
      </section>

      <section className="settings__card">
        <h2 className="settings__card-title">本地数据</h2>
        <p className="settings__card-hint">
          收藏、观看历史和续播进度都存在浏览器 localStorage 里，不会上传到任何地方。换设备或清缓存就没了。
        </p>

        {confirmClear ? (
          <div className="settings__actions">
            <span className="settings__probe is-fail">确定要清空收藏、历史与进度吗？</span>
            <button type="button" className="settings__danger" onClick={clear}>
              确认清空
            </button>
            <button type="button" className="settings__test" onClick={() => setConfirmClear(false)}>
              取消
            </button>
          </div>
        ) : (
          <div className="settings__actions">
            <button type="button" className="settings__test" onClick={() => setConfirmClear(true)}>
              <Icon name="close" size={15} />
              清空本地数据
            </button>
          </div>
        )}
      </section>

      <section className="settings__card">
        <h2 className="settings__card-title">能力边界</h2>
        <p className="settings__card-hint">
          下面几条是后端接口的实测结论，不是本前端的缺陷，写在这里免得误判：
        </p>
        <ul className="settings__facts">
          <li>搜索接口要求已注册的设备身份，当前通道返回 <code>100103</code>，所以「搜索」页会降级引导到「探索」。</li>
          <li>厂商后端只认 <code>limit</code>，<code>offset</code> 会被忽略；分页是自研后端补的，「探索」页首屏取 {BROWSE_LIMIT} 条，点「加载更多」继续往下翻。</li>
          <li>官方榜单只有漫剧有；真人剧和 AI 剧的排行榜由热度排序顶替。</li>
          <li>「今日上新」只有真人剧能精确到当天，漫剧和 AI 剧只能给到 7 天内。</li>
          <li>视频走服务端离线解密，某一集第一次播放要等 10–60 秒，播过一次之后就快了。</li>
        </ul>
      </section>
    </div>
  )
}
