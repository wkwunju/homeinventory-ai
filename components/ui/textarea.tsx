import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'underline'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseDefault = "flex min-h-[80px] w-full rounded-2xl border border-[#eaeaea] bg-white px-4 py-3 text-[14px] shadow-sm transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2A7B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#dcdcdc]"
    const baseUnderline = "flex min-h-[80px] w-full bg-transparent border-0 border-b border-[#eaeaea] rounded-none px-0 py-3 text-[14px] transition-colors duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-0 focus:border-[#CBB7FF] disabled:cursor-not-allowed disabled:opacity-50"
    return (
      <textarea
        className={cn(variant === 'underline' ? baseUnderline : baseDefault, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
