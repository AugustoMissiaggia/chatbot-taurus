'use client'

export function CustomButton({ children, className = '', variant = 'primary', ...props }) {
  const baseStyle = 'font-semibold py-2 px-4 rounded transition-all'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
