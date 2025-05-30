'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '../../lib/api/auth'
import { CustomButton } from '../components/ui/CustomButtom'


export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')
        const userId = localStorage.getItem('user_id')

        if (accessToken && userId) {
            router.push(`/chat/${userId}`)
        }
    }, [router])
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await loginUser(username, password)
            localStorage.setItem('user_id', data.user_id)
            router.push(`/chat/${data.user_id}`)
        } catch (err) {
            setError('Usuário ou senha inválidos.')
        }
    }

    const handleGoToRegister = () => {
        router.push('/register')
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                <CustomButton type="submit" className="w-full">Entrar</CustomButton>
            </form>

            <div className="mt-4">
                <p className="text-sm">Ainda não tem uma conta?</p>
                <CustomButton onClick={handleGoToRegister} className="mt-2 bg-blue-500 hover:bg-blue-600">
                    Registrar
                </CustomButton>
            </div>
        </main>
    )
}
