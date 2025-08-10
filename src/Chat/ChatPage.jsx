// src/Chat/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../ChatCSS/ChatPage.module.css'; // ✅ 새로운 CSS Modules 임포트

function ChatPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); // 메시지 스크롤 하단 자동 이동용

  // 더미 채팅 목록 (실제로는 API에서 불러옴)
  const [chatRooms, setChatRooms] = useState([
    {
      id: 'room1',
      otherUser: '판매자 A',
      lastMessage: '네, 가능합니다.',
      lastMessageTime: '15:30',
      unreadCount: 2,
      profileImage: 'https://via.placeholder.com/50?text=A',
    },
    {
      id: 'room2',
      otherUser: '구매자 B',
      lastMessage: '언제쯤 배송되나요?',
      lastMessageTime: '어제',
      unreadCount: 0,
      profileImage: 'https://via.placeholder.com/50?text=B',
    },
    {
      id: 'room3',
      otherUser: '매입자 C',
      lastMessage: '가격 조정 문의드립니다.',
      lastMessageTime: '07/28',
      unreadCount: 1,
      profileImage: 'https://via.placeholder.com/50?text=C',
    },
  ]);

  // 더미 메시지 (실제로는 API에서 불러옴)
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState(''); // 사용자가 입력할 메시지
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null); // 선택된 채팅방 ID

  // 선택된 채팅방의 더미 메시지 로드 (실제로는 room ID에 따라 API 호출)
  useEffect(() => {
    if (selectedChatRoomId) {
      // 실제 API 호출: fetchMessages(selectedChatRoomId)
      const dummyMessages = [
        { id: 1, sender: 'other', text: '안녕하세요.', time: '10:00' },
        { id: 2, sender: 'me', text: '네 안녕하세요!', time: '10:01' },
        { id: 3, sender: 'other', text: '상품에 대해 문의드립니다.', time: '10:02' },
        { id: 4, sender: 'me', text: '어떤 점이 궁금하신가요?', time: '10:03' },
        { id: 5, sender: 'other', text: '네, 가능합니다.', time: '15:30' },
        { id: 6, sender: 'me', text: '알겠습니다!', time: '15:31' },
      ];
      setMessages(dummyMessages);
    } else {
      setMessages([]);
    }
  }, [selectedChatRoomId]);

  // 메시지 스크롤을 항상 하단으로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (currentMessage.trim() && selectedChatRoomId) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'me',
        text: currentMessage.trim(),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setCurrentMessage(''); // 입력창 초기화
      // 실제로는 API로 메시지 전송 후 서버 응답에 따라 업데이트 (실시간 통신 필요)
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatHeader}>
        <button onClick={handleBack} className={styles.backButton}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
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
                  {room.unreadCount > 0 && (
                    <span className={styles.chatRoomUnread}>{room.unreadCount}</span>
                  )}
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
                {messages.map((msg) => (
                  <div key={msg.id} className={`${styles.messageItem} ${msg.sender === 'me' ? styles.myMessage : styles.otherMessage}`}>
                    <div className={styles.messageBubble}>
                      {msg.text}
                      <span className={styles.messageTime}>{msg.time}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* 스크롤 위치 지정용 */}
              </div>

              <div className={styles.chatInputArea}>
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.messageInput}
                />
                <button onClick={handleSendMessage} className={styles.sendMessageButton}>
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