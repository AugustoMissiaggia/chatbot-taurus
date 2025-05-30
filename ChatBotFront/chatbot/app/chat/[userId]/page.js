import ChatClient from './ChatClient'

export default function ChatPage({ params }) {
  const { userId } = params

  return <ChatClient userId={userId} />
}
