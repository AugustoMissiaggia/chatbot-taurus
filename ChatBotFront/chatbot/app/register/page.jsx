'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '../../lib/api/auth'
import { CustomButton } from '../components/ui/CustomButtom'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    const userId = localStorage.getItem('user_id')
    if (accessToken && userId) {
      router.push(`/chat/${userId}`)
    }
  }, [router])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await registerUser(username, email, password)
      setSuccess('Usuário registrado com sucesso! Redirecionando...')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Conta</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="email"
          placeholder="Email (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded text-black"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <CustomButton type="submit" className="w-full">Registrar</CustomButton>
      </form>

      <button
        onClick={() => router.push('/login')}
        className="mt-4 text-blue-600 underline text-sm"
      >
        Já tem uma conta? Entrar
      </button>
    </main>
  )
}
