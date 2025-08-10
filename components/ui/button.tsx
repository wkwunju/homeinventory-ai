import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'accent' | 'success' | 'warning'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-sky-200/50 transform hover:-translate-y-0.5': variant === 'default',
            'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-sky-200/50 transform hover:-translate-y-0.5': variant === 'primary',
            'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-200/50 transform hover:-translate-y-0.5': variant === 'accent',
            'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-200/50 transform hover:-translate-y-0.5': variant === 'success',
            'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-amber-200/50 transform hover:-translate-y-0.5': variant === 'warning',
            'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-red-200/50 transform hover:-translate-y-0.5': variant === 'destructive',
            'border border-slate-200/60 bg-white/80 backdrop-blur-sm hover:bg-slate-50/80 hover:border-slate-300/60 text-slate-700 shadow-sm hover:shadow-md': variant === 'outline',
            'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 hover:bg-slate-100/80 border border-slate-200/60 shadow-sm hover:shadow-md': variant === 'secondary',
            'hover:bg-slate-50/80 hover:text-slate-800 text-slate-600': variant === 'ghost',
            'text-sky-600 underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-11 px-6 py-3': size === 'default',
            'h-9 px-4 py-2 rounded-xl': size === 'sm',
            'h-12 px-8 py-4 text-base': size === 'lg',
            'h-11 w-11': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button } 