import { ApiError } from '@/api/client'

/** 把接口异常翻译成用户能看懂的一句话。 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return '密钥无效, 请到「设置」填写 API Key'
    if (error.status === 404) return '该内容不存在或已下架'
    if (error.status === 503) return '签名服务未就绪, 请确认桌面端或 unidbg-sign 已启动'
    if (error.status >= 500) return '服务端出错了, 稍后重试'
    return error.message
  }
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return '服务响应超时了, 稍后重试'
  }
  if (error instanceof Error) {
    return error.message === 'Failed to fetch' ? '连不上服务, 请检查服务是否在运行' : error.message
  }
  return '未知错误'
}
