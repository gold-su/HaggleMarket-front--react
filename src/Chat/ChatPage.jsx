import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../ChatCSS/ChatPage.module.css";
import {
  fetchChatRooms,
  fetchChatMessages,
  sendChatMessage,
} from "../api/chat";
import { useLocation } from "react-router-dom";

const normalizeMessage = (raw) => {
  if (!raw) return "";
  let s = String(raw).replace(/\r\n/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g, " $1");
  s = s.replace(
    /([^\s])\s+([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g,
    "$1\u00A0$2"
  );
  return s;
};

function StarRating({ rating = 0, count = 0 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div
      className={styles.starWrap}
      aria-label={`평점 ${rating}점, 리뷰 ${count}개`}
    >
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className={styles.star}>
          ★
        </span>
      ))}
      {half && <span className={`${styles.star} ${styles.starHalf}`}>★</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className={`${styles.star} ${styles.starEmpty}`}>
          ★
        </span>
      ))}
      <span className={styles.starText}>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const preselectRoomId = query.get("roomId");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ 서버에서 불러올 채팅방 목록
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  const [moreOpenHeader, setMoreOpenHeader] = useState(false);
  const [listMoreOpen, setListMoreOpen] = useState(false);
  const [blockedRooms, setBlockedRooms] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("blockedRooms") || "[]");
    } catch {
      return [];
    }
  });

  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [selectedUnblockIds, setSelectedUnblockIds] = useState([]);

  const selectedRoom = useMemo(
    () => chatRooms.find((r) => r.roomId === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  );

  // ✅ [1] 채팅방 목록 불러오기
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchChatRooms();
        setChatRooms(data);
      } catch (err) {
        console.error("채팅방 불러오기 실패", err);
      }
    };
    loadRooms();
  }, []);

  useEffect(() => {
    if (preselectRoomId) {
      setSelectedChatRoomId(Number(preselectRoomId));
    }
  }, [preselectRoomId]);

  // ✅ [2] 채팅방 선택 시 메시지 불러오기
  useEffect(() => {
    if (!selectedChatRoomId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await fetchChatMessages(selectedChatRoomId);
        setMessages(data.reverse()); // 최신순 정렬 시 reverse
      } catch (err) {
        console.error("메시지 불러오기 실패", err);
      }
    };
    loadMessages();
  }, [selectedChatRoomId]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };
  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
    autoResize();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ✅ [3] 메시지 전송 (백엔드 연동)
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedChatRoomId) return;
    const text = normalizeMessage(currentMessage);
    try {
      const sent = await sendChatMessage(selectedChatRoomId, text);
      setMessages((prev) => [...prev, sent]);
      setCurrentMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      console.error("메시지 전송 실패", err);
      alert("메시지 전송 실패");
    }
  };

  // ⛔️ 아래 UI 관련 로직(차단, 모달, 스타일)은 그대로 유지
  // ------------------------------------------------------------

  const handleBack = () => navigate(-1);
  const handleBlockRoom = () => {
    /* 그대로 */
  };
  const handleLeaveRoom = () => {
    /* 그대로 */
  };
  const onBuyNow = () => {
    /* 그대로 */
  };

  const renderMessage = (msg) => (
    <div className={styles.messageBubble}>{msg.content || msg.text}</div>
  );

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        {/* 좌측 채팅방 목록 */}
        <div className={styles.chatRoomList}>
          <div className={styles.listHeaderRow}>
            <h2>채팅 목록</h2>
          </div>

          {chatRooms.length === 0 ? (
            <p className={styles.emptyMessage}>채팅 목록이 없습니다.</p>
          ) : (
            chatRooms
              .filter((r) => !blockedRooms.includes(r.roomId))
              .map((room) => (
                <div
                  key={room.roomId}
                  className={`${styles.chatRoomItem} ${
                    selectedChatRoomId === room.roomId ? styles.active : ""
                  }`}
                  onClick={() => setSelectedChatRoomId(room.roomId)}
                >
                  <div className={styles.chatRoomDetails}>
                    <div className={styles.chatRoomUser}>
                      {room.otherUserName}
                    </div>
                    <div className={styles.chatRoomLastMessage}>
                      {room.lastMessage}
                    </div>
                  </div>
                  <div className={styles.chatRoomMeta}>
                    <span className={styles.chatRoomTime}>
                      {room.lastMessageTime?.slice(11, 16)}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* 우측 메시지 영역 */}
        <div className={styles.chatMessageArea}>
          {!selectedChatRoomId ? (
            <p className={styles.selectChatPrompt}>채팅을 선택해주세요.</p>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {messages.map((msg) => {
                  const isMe = msg.senderNo === msg.currentUserNo;
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.messageItem} ${
                        isMe ? styles.myMessage : styles.otherMessage
                      }`}
                    >
                      {renderMessage(msg)}
                      <span className={styles.timeBelow}>
                        {msg.createdAt?.slice(11, 16)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
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
                  type="button"
                  className={styles.sendMessageButton}
                  onClick={handleSendMessage}
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
