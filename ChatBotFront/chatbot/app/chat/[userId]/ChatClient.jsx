'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getMessages, sendMessage, sendMessageWithCsv } from '../../../lib/api/chat'
import { logoutUser } from '../../../lib/api/auth'

export default function ChatClient({ userId }) {
    const router = useRouter()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [csvFile, setCsvFile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        async function fetchMessages() {
            try {
                const data = await getMessages(userId)
                setMessages(data)
            } catch (err) {
                setError('Sessão expirada ou erro ao buscar mensagens.')
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [userId, router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return
        setSending(true)

        try {
            setMessages(prev => [...prev, { sender: 'user', text: newMessage }])

            if (csvFile) {
                const result = await sendMessageWithCsv(csvFile, newMessage)

                if (result instanceof Blob) {
                    const url = window.URL.createObjectURL(result)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'resultado.csv'
                    a.click()
                    window.URL.revokeObjectURL(url)

                    setMessages(prev => [...prev, { sender: 'chatgpt', text: '[Arquivo CSV gerado]' }])
                } else {
                    setMessages(prev => [...prev, { sender: 'chatgpt', text: result.resultado || 'Algum recurso sem suporte tentou ser gerado, tente outro prompt' }])
                }

                setCsvFile(null)
            } else {
                const response = await sendMessage(userId, newMessage)
                setMessages(prev => [...prev, { sender: 'chatgpt', text: response.text }])
            }

            setNewMessage('')
        } catch (err) {
            setError('Erro ao enviar mensagem.')
        } finally {
            setSending(false)
        }
    }

    const handleLogout = async () => {
        await logoutUser()
        router.push('/login')
    }

    return (
        <main className="min-h-screen flex flex-col items-center px-4 py-6 text-black">
            <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white ">Experimente o ChatBot</h1>
            </div>





            <div className="w-full max-w-2xl bg-white p-4 rounded shadow overflow-y-auto flex flex-col space-y-4 max-h-[100vh]">
                {loading ? (
                    <p>Carregando mensagens...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg max-w-[75%] ${msg.sender === 'user'
                                    ? 'bg-blue-100 self-start'
                                    : 'bg-green-100 self-end ml-auto'
                                }`}
                        >
                            <strong>{msg.sender === 'user' ? 'Você' : 'IA'}:</strong> {msg.text}
                        </div>
                    ))
                ) : (
                    <p>Nenhuma mensagem ainda.</p>
                )}
                <div ref={messagesEndRef} />
            </div>


            <div className="w-full max-w-2xl mt-4 flex items-center gap-2 relative">

                <label className="absolute left-3 cursor-pointer text-xl" title="Anexar CSV">
                    📎
                    <input
                        type="file"
                        accept=".csv"
                        onClick={(e) => (e.target.value = null)}
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                </label>


                <input
                    type="text"
                    className="flex-grow p-2 pl-10 border border-gray-300 rounded"
                    placeholder={csvFile ? `📄 ${csvFile.name}` : 'Digite sua mensagem...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                />


                <button
                    onClick={handleSendMessage}
                    disabled={sending}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {sending ? 'Enviando...' : 'Enviar'}
                </button>
            </div>


            {csvFile && !sending && (
                <div className="w-full max-w-2xl mt-2 text-right">
                    <button
                        onClick={() => setCsvFile(null)}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Remover CSV: {csvFile.name}
                    </button>
                </div>
            )}

        </main>
    )
}
