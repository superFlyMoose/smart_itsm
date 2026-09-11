import { SUCCESS_CODE, type ApiResult } from '@/types/common'
import { useAuthStore } from '@/lib/stores/auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/** 业务异常，携带后端错误码，便于页面做针对性提示 */
export class ApiError extends Error {
  code: string
  httpStatus: number

  constructor(code: string, message: string, httpStatus: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

/** 后端业务错误码：无权限访问 */
const FORBIDDEN_CODE = 'A0006'
/** 后端业务错误码：未登录/登录失效 */
const UNAUTHORIZED_CODE = 'A0005'

/** 判断错误是否为“无权限访问”（A0006），用于页面展示友好的无权限提示 */
export function isForbiddenError(err: unknown): boolean {
  return err instanceof ApiError && err.code === FORBIDDEN_CODE
}

/** 判断错误是否为“未登录/登录失效”（A0005）；401 已由 http 层自动跳登录 */
export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof ApiError && err.code === UNAUTHORIZED_CODE
}

type QueryValue = string | number | boolean | null | undefined

/** 仅约束参数值类型，接受任意查询 DTO（具名 interface 无隐式索引签名） */
type QueryParams = object

function buildUrl(path: string, params?: QueryParams): string {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  if (!params) return url
  const entries = Object.entries(params) as [string, QueryValue][]
  const search = new URLSearchParams()
  entries.forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      search.append(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `${url}?${query}` : url
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: QueryParams
  signal?: AbortSignal
  /** 上传文件时使用 FormData，调用方自行构造 */
  formData?: FormData
  /** 401 时是否自动跳转登录（登录接口本身需要置 false） */
  handleAuthError?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    formData,
    signal,
    handleAuthError = true,
  } = options

  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (!formData) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', '网络连接异常，请检查后端服务是否可用', 0)
  }

  let payload: ApiResult<T> | null = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResult<T>
    } catch {
      payload = null
    }
  }

  if (response.status === 401) {
    if (handleAuthError) {
      useAuthStore.getState().clearAuth()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    throw new ApiError(
      payload?.code ?? 'A0005',
      payload?.message ?? '登录已失效，请重新登录',
      response.status,
    )
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.code ?? `HTTP_${response.status}`,
      payload?.message ?? `请求失败（${response.status}）`,
      response.status,
    )
  }

  if (!payload) {
    throw new ApiError('S0001', '服务返回数据格式异常', response.status)
  }

  if (payload.code !== SUCCESS_CODE) {
    throw new ApiError(payload.code, payload.message || '业务处理失败', response.status)
  }

  return payload.data
}

export const http = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>(path, { method: 'GET', params, signal }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', formData }),
  rawLogin: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body, handleAuthError: false }),
}
