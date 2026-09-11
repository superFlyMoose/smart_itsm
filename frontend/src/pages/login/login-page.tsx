import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowRight,
  ChatCircleText,
  Headset,
  ShieldCheck,
  Timer,
} from '@phosphor-icons/react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/lib/stores/auth'
import { ApiError } from '@/lib/http/request'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'

const DEMO_ACCOUNTS = [
  { username: 'zhangwei', label: '普通用户' },
  { username: 'lina', label: '工程师' },
  { username: 'wangmanager', label: '团队负责人' },
  { username: 'admin', label: '系统管理员' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await authApi.login({ username: username.trim(), password })
      setAuth(result.token, result.user)
      // 始终进入当前账号自己的工作台；忽略 URL 上的 ?redirect= 残留参数，
      // 避免复用浏览器会话时把上一个账号最后浏览的页面带给新登录用户
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh bg-bg">
      {/* 品牌介绍区 */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(600px circle at 80% 10%, rgba(89,141,248,0.35), transparent 45%), radial-gradient(500px circle at 10% 90%, rgba(89,141,248,0.18), transparent 40%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500">
            <Headset size={20} weight="fill" />
          </span>
          <div>
            <p className="text-base font-semibold">Smart ITSM</p>
            <p className="text-xs text-brand-200">智能 IT 服务管理平台</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            让每一个 IT 服务请求
            <br />
            都有始有终
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-brand-200">
            覆盖工单全生命周期、SLA 监控、跨团队协作、知识库与 AI 辅助，
            为企业内部 IT 服务提供统一工作台。
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3">
            {[
              { icon: <Timer size={18} />, text: 'SLA 时限与超时升级全程跟踪' },
              { icon: <ChatCircleText size={18} />, text: '评论、协作、催办，处理过程可审计' },
              { icon: <ShieldCheck size={18} />, text: 'RBAC 权限码与数据权限双重控制' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-brand-100">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10">
                  {item.icon}
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-brand-300">仅供企业内部授权人员使用</p>
      </div>

      {/* 登录表单区 */}
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-brand-contrast">
              <Headset size={22} weight="fill" />
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-strong">欢迎登录</h2>
          <p className="mt-1 text-sm text-muted">使用分配的员工账号登录工作台</p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            <Field label="用户名" required>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                invalid={!!error}
              />
            </Field>
            <Field label="密码" required error={error}>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                invalid={!!error}
              />
            </Field>
            <Button type="submit" size="md" loading={loading} className="mt-1">
              登录
              {!loading && <ArrowRight size={16} weight="bold" />}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-dashed border-border-subtle bg-surface p-4">
            <p className="text-xs font-medium text-muted">演示账号（密码均为 123456），点击可快速填充</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => {
                    setUsername(account.username)
                    setPassword('123456')
                    setError(null)
                  }}
                  className="rounded-full border border-border-subtle px-2.5 py-1 text-xs text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  {account.label} · {account.username}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-faint">
            <Link to="/" className="hover:text-brand">
              返回首页
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
