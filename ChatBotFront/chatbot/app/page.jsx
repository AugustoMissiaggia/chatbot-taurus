"use client"

import { useRouter } from 'next/navigation'
import { CustomButton } from './components/ui/CustomButtom'

export default function Home() {

  const router = useRouter()

  const handleTryChat = () => {
    const accessToken = localStorage.getItem('accessToken')
    const userId = localStorage.getItem('user_id')

    if (accessToken && userId) {
      router.push(`/chat/${userId}`)
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Bem-vindo ao ChatBot Corporativo</h1>
      <p className="text-lg mb-6 max-w-xl">
        Este projeto demonstra como a inteligência artificial pode automatizar tarefas corporativas, como o tratamento de planilhas e atendimento por chat.
      </p>
      <CustomButton onClick={handleTryChat} className="text-lg px-6 py-2">
        Try the chatbot
      </CustomButton>
    </main>
  )
}
