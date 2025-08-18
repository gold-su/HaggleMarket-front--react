// src/Chat/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../ChatCSS/ChatPage.module.css';

// 문장부호 줄튀김 방지 + 개행 보존 정리
const normalizeMessage = (raw) => {
  if (!raw) return '';
  let s = String(raw).replace(/\r\n/g, '\n');          // CRLF → LF
  s = s.replace(/[ \t]+\n/g, '\n');                    // 줄 끝 공백 제거
  // 줄 시작 문장부호는 이전 줄과 결합: "\n!" → " !"
  s = s.replace(/\n([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g, ' $1');
  // 단어 뒤 공백 + 문장부호는 비분리 공백으로: "안녕하세요 !" → "안녕하세요 !"
  s = s.replace(/([^\s])\s+([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g, '$1\u00A0$2');
  return s;
};

function ChatPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 더미 채팅방 목록
  const [chatRooms] = useState([
    { id: 'room1', otherUser: '판매자 A', lastMessage: '네, 가능합니다.', lastMessageTime: '15:30', unreadCount: 2, profileImage: 'https://via.placeholder.com/50?text=A' },
    { id: 'room2', otherUser: '구매자 B', lastMessage: '언제쯤 배송되나요?', lastMessageTime: '어제', unreadCount: 0, profileImage: 'https://via.placeholder.com/50?text=B' },
    { id: 'room3', otherUser: '매입자 C', lastMessage: '가격 조정 문의드립니다.', lastMessageTime: '07/28', unreadCount: 1, profileImage: 'https://via.placeholder.com/50?text=C' },
  ]);

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  // 채팅방 선택 시 더미 메시지 로드
  useEffect(() => {
    if (selectedChatRoomId) {
      const dummy = [
        { id: 1, sender: 'other', text: '안녕하세요.', time: '10:00' },
        { id: 2, sender: 'me', text: '네 안녕하세요!', time: '10:01' },
        { id: 3, sender: 'other', text: '상품에 대해 문의드립니다.', time: '10:02' },
        { id: 4, sender: 'me', text: '어떤 점이 궁금하신가요?', time: '10:03' },
        { id: 5, sender: 'other', text: '네, 가능합니다.', time: '15:30' },
        { id: 6, sender: 'me', text: '알겠습니다!\n줄 바꾸기 테스트 중이에요 :)', time: '15:31' },
      ];
      setMessages(dummy);
    } else {
      setMessages([]);
    }
  }, [selectedChatRoomId]);

  // 새 메시지 도착 시 하단으로 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // textarea 자동 높이
  const autoResize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
    autoResize();
  };

  // Enter=전송, Shift+Enter=줄바꿈
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedChatRoomId) return;
    const text = normalizeMessage(currentMessage); // 개행 보존 + 문장부호 줄앞 방지

    const newMessage = {
      id: messages.length + 1,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setCurrentMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleBack = () => navigate(-1);

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatHeader}>
        <button onClick={handleBack} className={styles.backButton}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <h1 className={styles.pageTitle}>해글톡</h1>
      </div>

      <div className={styles.chatContainer}>
        {/* 채팅방 목록 */}
        <div className={styles.chatRoomList}>
          <h2>채팅 목록</h2>
          {chatRooms.length === 0 ? (
            <p className={styles.emptyMessage}>채팅 목록이 없습니다.</p>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                className={`${styles.chatRoomItem} ${selectedChatRoomId === room.id ? styles.active : ''}`}
                onClick={() => setSelectedChatRoomId(room.id)}
              >
                <img src={room.profileImage} alt="프로필" className={styles.chatRoomProfile} />
                <div className={styles.chatRoomDetails}>
                  <div className={styles.chatRoomUser}>{room.otherUser}</div>
                  <div className={styles.chatRoomLastMessage}>{room.lastMessage}</div>
                </div>
                <div className={styles.chatRoomMeta}>
                  <span className={styles.chatRoomTime}>{room.lastMessageTime}</span>
                  {room.unreadCount > 0 && <span className={styles.chatRoomUnread}>{room.unreadCount}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 채팅 메시지 영역 */}
        <div className={styles.chatMessageArea}>
          {!selectedChatRoomId ? (
            <p className={styles.selectChatPrompt}>채팅을 선택해주세요.</p>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageItem} ${isMe ? styles.myMessage : styles.otherMessage}`}
                    >
                      {/* 시간은 말풍선 '아래'에 배치 */}
                      <div className={styles.messageBubble}>
                        <span className={styles.messageText}>{msg.text}</span>
                      </div>
                      <span className={styles.timeBelow}>{msg.time}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역: 안내 문구 제거 */}
              <div className={styles.chatInputArea}>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="메시지를 입력하세요…"
                  value={currentMessage}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${styles.messageInput} ${styles.messageTextarea}`}
                />
                <button
                  onClick={handleSendMessage}
                  className={styles.sendMessageButton}
                  disabled={!currentMessage.trim()}
                >
                  전송
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;