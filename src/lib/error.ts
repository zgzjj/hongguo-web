import { ApiError } from '@/api/client'

/**
 * 把接口异常翻译成用户能看懂的一句话。
 * 这里只说"出了什么事、要不要重试", 不解释内部机制 ——
 * 排障用的接口细节统一收在「设置」页, 不往普通观众眼前塞。
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return '访问密钥无效，请到「设置」重新生成'
    if (error.status === 404) return '该内容不存在或已下架'
    if (error.status === 503) return '服务还没准备好，稍后重试'
    if (error.status >= 500) return '出错了，稍后重试'
    return error.message
  }
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return '响应超时了，稍后重试'
  }
  if (error instanceof Error) {
    return error.message === 'Failed to fetch' ? '连不上服务，请确认服务在运行' : error.message
  }
  return '未知错误'
}
