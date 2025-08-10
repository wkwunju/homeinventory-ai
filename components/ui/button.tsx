import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'accent' | 'success' | 'warning' | 'blue'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8A5C2] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-[#FFD39A] via-[#F8A5C2] to-[#CBB7FF] text-white hover:shadow-md hover:brightness-105': variant === 'default',
            'bg-gradient-to-r from-[#FFD39A] via-[#F8A5C2] to-[#CBB7FF] text-white hover:shadow-md hover:brightness-105': variant === 'primary',
            'bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#8B5CF6] text-white hover:shadow-lg hover:brightness-110': variant === 'blue',
            'bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669] text-white hover:shadow-md hover:brightness-105': variant === 'accent',
            'bg-gradient-to-r from-[#34d399] via-[#10b981] to-[#059669] text-white hover:shadow-md hover:brightness-105': variant === 'success',
            'bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#f43f5e] text-white hover:shadow-md hover:brightness-105': variant === 'warning',
            'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white hover:shadow-md hover:brightness-105': variant === 'destructive',
            'border border-[#eaeaea] bg-white hover:bg-[#fafafa] text-slate-800 shadow-sm': variant === 'outline',
            'bg-[#f5f5f5] text-slate-800 border border-[#eaeaea] hover:bg-[#f0f0f0] shadow-sm': variant === 'secondary',
            'hover:bg-[#f5f5f5] text-slate-700': variant === 'ghost',
            'text-[#DD2A7B] underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-5': size === 'default',
            'h-9 px-4': size === 'sm',
            'h-11 px-7 text-base': size === 'lg',
            'h-10 w-10': size === 'icon',
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