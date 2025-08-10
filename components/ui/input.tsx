import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'underline'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', ...props }, ref) => {
    const baseDefault = "flex h-11 w-full rounded-2xl border border-[#eaeaea] bg-white px-4 py-2.5 text-[14px] shadow-sm transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2A7B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#dcdcdc]"
    const baseUnderline = "flex h-11 w-full bg-transparent border-0 border-b border-[#eaeaea] rounded-none px-0 py-3 text-[14px] transition-colors duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-0 focus:border-[#CBB7FF] disabled:cursor-not-allowed disabled:opacity-50"
    return (
      <input
        type={type}
        className={cn(variant === 'underline' ? baseUnderline : baseDefault, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
