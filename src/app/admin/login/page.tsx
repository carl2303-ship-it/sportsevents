import { Suspense } from 'react'
import StaffLoginForm from './login-form'

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-sm">
          A carregar...
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  )
}
