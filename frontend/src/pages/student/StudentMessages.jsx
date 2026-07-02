import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Briefcase, ArrowLeft } from 'lucide-react';
import { applicationsApi } from '../../api/applications';
import { messagesApi } from '../../api/messages';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';
import { formatRelativeTime } from '../../lib/utils';

export default function StudentMessages() {
  const { appId: urlAppId } = useParams();
  const { user }            = useAuth();
  const socket              = useSocket();
  const qc                  = useQueryClient();
  const [activeAppId,  setActiveAppId]  = useState(urlAppId ? String(urlAppId) : null);
  const [showList,     setShowList]     = useState(!urlAppId);
  const [messages,     setMessages]     = useState([]);
  const [msgLoading,   setMsgLoading]   = useState(false);
  const [input,        setInput]        = useState('');
  const [sending,      setSending]      = useState(false);
  const [peerTyping,   setPeerTyping]   = useState(false);
  const bottomRef        = useRef(null);
  const typingTimer      = useRef(null);
  const lastScrolledMsgRef = useRef(null);

  const { data: threads } = useQuery({
    queryKey: ['message-threads-student'],
    queryFn:  () => messagesApi.threads().then(r => r.data.data),
  });

  useEffect(() => {
    if (!activeAppId && threads?.length > 0) {
      setActiveAppId(String(threads[0].appId));
    }
  }, [threads, activeAppId]);

  const activeThread = threads?.find(t => String(t.appId) === activeAppId);

  const { data: freshApp } = useQuery({
    queryKey: ['app-for-new-thread', activeAppId],
    queryFn:  () => applicationsApi.getOne(activeAppId).then(r => r.data.data),
    enabled:  !!activeAppId && activeThread === undefined && threads !== undefined,
  });

  useEffect(() => {
    if (!activeAppId) return;
    let cancelled = false;
    setMessages([]);
    setMsgLoading(true);
    const load = () => messagesApi.getThread(activeAppId)
      .then(r => { if (!cancelled) setMessages(r.data.data || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setMsgLoading(false); });
    load();
    const poll = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [activeAppId]);

  useEffect(() => {
    if (!messages.length) return;
    const lastId = messages[messages.length - 1]?.id;
    if (lastId && lastId !== lastScrolledMsgRef.current) {
      lastScrolledMsgRef.current = lastId;
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeAppId) return;
    socket.emit('join_thread', activeAppId);
    const onMessage = (msg) => {
      setMessages(prev => {
        // Replace any matching optimistic message (same sender + content + within 10s)
        const now = Date.now();
        const idx = prev.findIndex(m =>
          m.id?.startsWith('opt-') &&
          m.senderId === msg.senderId &&
          m.content === msg.content &&
          now - new Date(m.sentAt).getTime() < 10_000
        );
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = msg;
          return next;
        }
        return [...prev, msg];
      });
      qc.invalidateQueries({ queryKey: ['message-threads-student'] });
    };
    const onRead = ({ messageIds }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m.id) ? { ...m, isRead: true } : m));
    };
    const onTyping = ({ isTyping }) => setPeerTyping(isTyping);
    // Re-join the thread room after any reconnect (Socket.IO clears rooms on disconnect)
    const onReconnect = () => socket.emit('join_thread', activeAppId);
    socket.on('new_message', onMessage);
    socket.on('messages_read', onRead);
    socket.on('user_typing', onTyping);
    socket.on('connect', onReconnect);
    return () => {
      socket.off('new_message', onMessage);
      socket.off('messages_read', onRead);
      socket.off('user_typing', onTyping);
      socket.off('connect', onReconnect);
      socket.emit('leave_thread', activeAppId);
      setPeerTyping(false);
    };
  }, [socket, activeAppId, qc]);

  const switchThread = (id) => {
    setActiveAppId(String(id));
    setShowList(false);
    setInput('');
    setPeerTyping(false);
  };

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    if (!socket || !activeAppId) return;
    socket.emit('typing', { appId: activeAppId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { appId: activeAppId, isTyping: false });
    }, 2000);
  }, [socket, activeAppId]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeAppId || sending) return;
    // Optimistic: clear input and show message immediately — don't wait for the server
    setInput('');
    const optimistic = {
      id: `opt-${Date.now()}`, appId: activeAppId,
      senderId: user?.id, content: text,
      isRead: false, sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setSending(true);
    try {
      await messagesApi.send(activeAppId, text);
      qc.invalidateQueries({ queryKey: ['message-threads-student'] });
    } catch {
      // revert optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const headerTitle    = activeThread?.offer?.title ?? freshApp?.offer?.title ?? '…';
  const headerSubtitle = activeThread?.offer?.company_profiles?.company_name
    ?? freshApp?.offer?.company?.companyName
    ?? '';

  return (
    <div className="flex h-[calc(100vh-9rem)] rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1px solid #E7E6DF', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Thread list sidebar */}
      <div className={`${showList ? 'flex' : 'hidden'} sm:flex w-full sm:w-64 flex-shrink-0 flex-col`}
        style={{ borderRight: '1px solid #E7E6DF' }}>
        <div className="px-4 py-4" style={{ borderBottom: '1px solid #E7E6DF' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#1B1D1A' }}>Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads === undefined ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-xs text-center p-4 space-y-2">
              <Briefcase size={28} style={{ color: '#DDDBD2' }} />
              <p style={{ color: '#9A9E97' }}>No conversations yet.</p>
              <p style={{ color: '#C0BFBA' }}>Apply to an offer to start chatting.</p>
            </div>
          ) : threads.map(thread => {
            const isActive = String(thread.appId) === activeAppId;
            return (
              <button key={thread.appId}
                onClick={() => switchThread(thread.appId)}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{
                  background: isActive ? '#EDF2EE' : 'transparent',
                  borderLeft: isActive ? '2px solid #1E5B45' : '2px solid transparent',
                  borderBottom: '1px solid #F0F0EA',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F6F5F1'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#1B1D1A' }}>{thread.offer?.title}</p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: '#9A9E97' }}>
                      {thread.offer?.company_profiles?.company_name}
                    </p>
                    {thread.lastMessage && (
                      <p className="text-[10px] truncate mt-0.5" style={{ color: '#C0BFBA' }}>{thread.lastMessage.content}</p>
                    )}
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ background: '#1E5B45', color: '#fff' }}>
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {!activeAppId ? (
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div className="text-center">
            <Briefcase size={40} className="mx-auto mb-3" style={{ color: '#DDDBD2' }} />
            <p className="text-sm" style={{ color: '#9A9E97' }}>Select a conversation</p>
          </div>
        </div>
      ) : (
        <div className={`${showList ? 'hidden' : 'flex'} sm:flex flex-1 flex-col`}>
          {/* Chat header */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E7E6DF' }}>
            <button onClick={() => setShowList(true)}
              className="sm:hidden flex-shrink-0 transition-colors"
              style={{ color: '#9A9E97' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1B1D1A'}
              onMouseLeave={e => e.currentTarget.style.color = '#9A9E97'}>
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: '#1B1D1A' }}>{headerTitle}</p>
              <p className="text-xs truncate" style={{ color: '#9A9E97' }}>{headerSubtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 dashboard-scroll">
            {msgLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: '#C0BFBA' }}>No messages yet. Say hello!</p>
              </div>
            ) : messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    name={isMe ? 'Me' : headerSubtitle}
                    src={isMe
                      ? (user?.studentProfile?.avatarUrl || user?.avatarUrl)
                      : activeThread?.offer?.company_profiles?.logo_url}
                    size="xs" />
                  <div className="max-w-xs rounded-2xl px-4 py-2.5"
                    style={isMe
                      ? { background: '#1E5B45', color: '#fff', borderRadius: '16px 16px 4px 16px' }
                      : { background: '#F6F5F1', color: '#1B1D1A', border: '1px solid #E7E6DF', borderRadius: '16px 16px 16px 4px' }}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] mt-1" style={{ color: isMe ? 'rgba(255,255,255,0.6)' : '#9A9E97' }}>
                      {formatRelativeTime(msg.sentAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            {peerTyping && (
              <div className="flex gap-3">
                <Avatar name={headerSubtitle} src={activeThread?.offer?.company_profiles?.logo_url} size="xs" />
                <div className="rounded-2xl px-4 py-3 flex items-center gap-1"
                  style={{ background: '#F6F5F1', border: '1px solid #E7E6DF' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#9A9E97', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#9A9E97', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#9A9E97', animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="px-5 py-4" style={{ borderTop: '1px solid #E7E6DF' }}>
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{ background: '#F6F5F1', border: '1px solid #E7E6DF' }}>
              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: '#1B1D1A' }}
              />
              <button onClick={sendMessage} disabled={sending}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                style={{ background: '#1E5B45' }}
                onMouseEnter={e => e.currentTarget.style.background = '#10342A'}
                onMouseLeave={e => e.currentTarget.style.background = '#1E5B45'}>
                <Send size={14} style={{ color: '#fff' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
