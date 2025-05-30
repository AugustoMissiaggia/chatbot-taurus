'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { logoutUser } from '../../lib/api/auth'
import { usePathname } from 'next/navigation' 

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname() 

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
  }, [pathname]) 

  const handleLogout = async () => {
    await logoutUser()
    setIsLoggedIn(false)
  }

  return (
    <header className="w-full bg-blue-600 text-white py-4 shadow">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">ChatBot</Link>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">Início</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
