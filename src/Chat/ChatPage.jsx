import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../ChatCSS/ChatPage.module.css";
import {
  fetchChatRooms,
  fetchChatMessages,
  sendChatMessage,
} from "../api/chat";

// ✅ 백엔드 API 서버 주소
const BASE_URL = "http://localhost:8080"; // 🔹 배포 시 실제 주소로 변경
const DEFAULT_AVATAR = "/images/default-avatar.jpg";

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
    <div className={styles.starWrap}>
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
  const { search } = useLocation();
  const preselectRoomId = new URLSearchParams(search).get("roomId");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  const selectedRoom = useMemo(
    () => chatRooms.find((r) => r.roomId === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChatRooms();
        setChatRooms(data);
      } catch (e) {
        console.error("채팅방 불러오기 실패", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (preselectRoomId) setSelectedChatRoomId(Number(preselectRoomId));
  }, [preselectRoomId]);

  useEffect(() => {
    if (!selectedChatRoomId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const data = await fetchChatMessages(selectedChatRoomId);
        setMessages(data.reverse());
      } catch (e) {
        console.error("메시지 불러오기 실패", e);
      }
    })();
  }, [selectedChatRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedChatRoomId) return;
    try {
      const sent = await sendChatMessage(
        selectedChatRoomId,
        normalizeMessage(currentMessage)
      );
      setMessages((prev) => [...prev, sent]);
      setCurrentMessage("");
      textareaRef.current && (textareaRef.current.style.height = "auto");
    } catch (e) {
      console.error("메시지 전송 실패", e);
      alert("메시지 전송 실패");
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return DEFAULT_AVATAR;

    try {
      // 이미 절대경로면 그대로 반환
      if (/^https?:\/\//i.test(url)) return url;

      // BASE_URL이 붙지 않은 상대경로면 서버 주소 붙이기
      if (url.startsWith("/")) return `${BASE_URL}${url}`;

      // 혹시 앞에 슬래시 빠진 경우도 대비
      return `${BASE_URL}/${url}`;
    } catch (e) {
      console.error("resolveImageUrl 실패:", url, e);
      return DEFAULT_AVATAR;
    }
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        {/* 좌측 채팅 목록 */}
        <div className={styles.chatRoomList}>
          <div className={styles.listHeaderRow}>
            <h2>채팅 목록</h2>
          </div>

          {chatRooms.length === 0 ? (
            <p className={styles.emptyMessage}>채팅 목록이 없습니다.</p>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.roomId}
                className={`${styles.chatRoomItem} ${
                  selectedChatRoomId === room.roomId ? styles.active : ""
                }`}
                onClick={() => setSelectedChatRoomId(room.roomId)}
              >
                <img
                  className={styles.chatRoomProfile}
                  src={resolveImageUrl(room.otherUserProfileImageUrl)}
                  alt="프로필"
                  onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                />

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
                    {room.lastMessageTime
                      ? new Date(room.lastMessageTime).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 우측 메시지 영역 */}
        <div className={styles.chatMessageArea}>
          {/* 헤더 */}
          <div className={styles.chatHeader}>
            {selectedRoom ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className={styles.backButton}
                  aria-label="뒤로가기"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    height="24"
                  >
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>
                <img
                  className={styles.headerAvatar}
                  src={resolveImageUrl(selectedRoom.otherUserProfileImageUrl)}
                  alt="프로필"
                  onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
                />

                <div className={styles.headerTitleArea}>
                  <div className={styles.storeName}>
                    {selectedRoom.otherUserName}
                  </div>
                  <StarRating rating={4.8} count={132} />
                </div>
                <div className={styles.headerActionsRight}>
                  <button type="button" className={styles.buyButton}>
                    구매하기
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.headerTitleArea}>
                <div className={styles.storeName}>해글톡 💬</div>
              </div>
            )}
          </div>

          {!selectedChatRoomId ? (
            <p className={styles.selectChatPrompt}>채팅을 선택해주세요.</p>
          ) : (
            <>
              <div className={styles.chatMessages}>
                {messages.map((msg, idx) => {
                  const isMe = msg.senderNo === msg.currentUserNo;
                  const msgDate = new Date(msg.createdAt).toLocaleDateString(
                    "ko-KR",
                    {
                      month: "2-digit",
                      day: "2-digit",
                    }
                  );
                  const prevDate =
                    idx > 0
                      ? new Date(
                          messages[idx - 1].createdAt
                        ).toLocaleDateString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : null;
                  const showDivider = msgDate !== prevDate;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDivider && (
                        <div className={styles.dateDivider}>
                          ―― {msgDate} ――
                        </div>
                      )}
                      <div
                        className={`${styles.messageItem} ${
                          isMe ? styles.myMessage : styles.otherMessage
                        }`}
                      >
                        <div className={styles.messageBubble}>
                          {msg.content}
                        </div>
                        <span className={styles.timeBelow}>
                          {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.chatInputArea}>
                <textarea
                  ref={textareaRef}
                  rows={1}
                  placeholder="메시지를 입력하세요…"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
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
