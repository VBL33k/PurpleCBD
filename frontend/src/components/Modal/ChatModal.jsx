import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import s from './ChatModal.module.css';

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

export default function ChatModal({ orderId, orderRef, senderType, senderName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    // Load existing messages
    supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setMessages(data || []); setLoading(false); });

    // Subscribe to new messages (realtime)
    const channel = supabase
      .channel(`chat:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `order_id=eq.${orderId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setInput('');
    await supabase.from('chat_messages').insert({
      order_id: orderId,
      sender: senderType,
      sender_name: senderName,
      content,
    });
  }

  return (
    <div className={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.modal}>
        <div className={s.header}>
          <div className={s.headerInfo}>
            <span className={s.title}>Chat en direct</span>
            <span className={s.sub}>Commande #{orderRef?.slice(-6).toUpperCase()}</span>
          </div>
          <button className={s.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={s.messages}>
          {loading && <div className={s.centerMsg}>Chargement...</div>}
          {!loading && messages.length === 0 && (
            <div className={s.centerMsg}>
              <div className={s.emptyChat}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p>Aucun message pour l'instant.<br/>Démarrez la conversation !</p>
              </div>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.sender === senderType;
            return (
              <div key={msg.id} className={`${s.row} ${isMine ? s.rowRight : s.rowLeft}`}>
                {!isMine && (
                  <div className={s.senderTag}>
                    {msg.sender === 'vendor' ? '🟣 Équipe' : msg.sender_name || 'Client'}
                  </div>
                )}
                <div className={`${s.bubble} ${isMine ? s.bubbleMine : s.bubbleTheirs}`}>
                  {msg.content}
                </div>
                <span className={s.time}>
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className={s.inputArea} onSubmit={sendMessage}>
          <input
            ref={inputRef}
            className={s.input}
            type="text"
            placeholder="Écrire un message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            maxLength={500}
          />
          <button type="submit" className={s.sendBtn} disabled={!input.trim()}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
