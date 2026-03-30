import Markdown from 'react-markdown'

function ChatTextContent({ text }) {
  return <Markdown>{text}</Markdown>
}

export default function ChatText({ role, text, isPending = false }) {
  const isUser = role === 'user'
  return (
    <article
      className={[
        'chat-msg',
        isUser ? 'chat-msg-user' : 'chat-msg-assistant',
        isPending ? 'chat-msg-pending' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live={isPending ? 'polite' : undefined}
    >
      <div className="chat-bubble">
        <div className="chat-role">{isUser ? 'Você' : 'CDC'}</div>
        <div className="chat-text">{ChatTextContent({ text })}</div>
      </div>
    </article>
  )
}