/** 后端统一响应结构 Result<T> */
export interface ApiResult<T> {
  code: string
  message: string
  data: T
  traceId?: string
}

/** 后端分页结构 PageResult<T> */
export interface PageResult<T> {
  records: T[]
  pageNum: number
  pageSize: number
  total: number
  pages: number
}

/** 分页查询公共参数 */
export interface PageQuery {
  pageNum?: number
  pageSize?: number
}

/** 通用简要引用（部门/团队/分类） */
export interface SimpleRef {
  id: number
  name: string
}

/** 通用用户简要信息 */
export interface SimpleUser {
  id: number
  realName: string
}

/** 成功业务码 */
export const SUCCESS_CODE = '00000'
