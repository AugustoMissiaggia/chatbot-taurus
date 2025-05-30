'use client'

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-center text-sm text-gray-600 py-4 mt-8 border-t">
      <div className="max-w-6xl mx-auto px-4">
        © {new Date().getFullYear()} ChatBot Taurus. 
      </div>
    </footer>
  )
}
