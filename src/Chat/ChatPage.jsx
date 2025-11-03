// src/pages/ChatPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../ChatCSS/ChatPage.module.css";
import { fetchChatRooms, fetchChatMessages } from "../api/chat";
import { Client } from "@stomp/stompjs";

const BASE_HTTP_URL = "https://hagglemarket.onrender.com";
const BASE_WS_URL = "wss://hagglemarket.onrender.com/ws";
const DEFAULT_AVATAR = "/images/default-avatar.jpg";
const BOT_ROOM_NAME = "해글봇 💬";

// ✅ 메시지 정리 함수
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

// ⭐ 별점 UI
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

  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  const stompRef = useRef(null);
  const subRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const seenSetRef = useRef(new Set());

  const selectedRoom = useMemo(
    () => chatRooms.find((r) => r.roomId === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  );

  /** 🟩 1️⃣ 방 목록 로드 + 해글봇 항상 맨 위 고정 */
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChatRooms();
        const botRoom = data.find((r) => r.otherUserName === BOT_ROOM_NAME);
        const nonBotRooms = data.filter(
          (r) => r.otherUserName !== BOT_ROOM_NAME
        );
        setChatRooms(botRoom ? [botRoom, ...nonBotRooms] : data);

        if (preselectRoomId) {
          setSelectedChatRoomId(Number(preselectRoomId));
        } else if (botRoom) {
          setSelectedChatRoomId(botRoom.roomId);
        }
      } catch (e) {
        console.error("채팅방 불러오기 실패:", e);
      }
    })();
  }, [preselectRoomId]);

  /** 🟩 2️⃣ 선택된 방 메시지 로딩 */
  useEffect(() => {
    if (!selectedChatRoomId) {
      setMessages([]);
      seenSetRef.current.clear();
      return;
    }

    (async () => {
      try {
        const data = await fetchChatMessages(selectedChatRoomId);
        const reversed = data.reverse();
        const nextSeen = new Set(seenSetRef.current);
        for (const m of reversed) {
          const key = m.id ?? `${m.clientMsgId || "x"}:${m.senderNo || "x"}`;
          nextSeen.add(key);
        }
        seenSetRef.current = nextSeen;
        setMessages(reversed);
      } catch (e) {
        console.error("메시지 불러오기 실패:", e);
      }
    })();
  }, [selectedChatRoomId]);

  /** 🟩 3️⃣ STOMP 연결 (앱 생명주기 1회) */
  useEffect(() => {
    if (stompRef.current && stompRef.current.connected) {
      console.log("[WS] 이미 연결됨");
      return;
    }

    const token =
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";

    if (!token) {
      console.warn("[WS] ❌ JWT 토큰 없음, 연결 불가");
      return;
    }

    const wsFactory = () =>
      new WebSocket(
        `${BASE_WS_URL}?Authorization=${encodeURIComponent(`Bearer ${token}`)}`
      );

    const client = new Client({
      webSocketFactory: wsFactory,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (msg) => console.log("[STOMP]", msg),
      reconnectDelay: 0,
      onConnect: () => console.log("✅ STOMP 연결 성공"),
      onStompError: (f) => console.error("❌ STOMP 에러:", f.body),
      onWebSocketError: (e) => console.error("❌ WS 에러:", e),
      onWebSocketClose: (e) => console.warn("⚠️ WS 종료:", e),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      if (subRef.current) subRef.current.unsubscribe();
      client.deactivate();
      stompRef.current = null;
    };
  }, []);

  /** 🟩 4️⃣ 방 변경 시 구독 갱신 */
  useEffect(() => {
    const client = stompRef.current;
    if (!client || !client.connected || !selectedChatRoomId) return;

    if (subRef.current) {
      subRef.current.unsubscribe();
      subRef.current = null;
    }

    const topic = `/topic/chat.room.${selectedChatRoomId}`;
    console.log("[STOMP] 구독:", topic);

    subRef.current = client.subscribe(topic, (frame) => {
      try {
        const msg = JSON.parse(frame.body);
        const key =
          msg.id ?? `${msg.clientMsgId || "x"}:${msg.senderNo || "x"}`;
        if (seenSetRef.current.has(key)) return;
        seenSetRef.current.add(key);
        setMessages((prev) => [...prev, msg]);

        // ✅ 봇방 절대 맨 위 고정 정렬
        setChatRooms((prev) => {
          const botRoom = prev.find((r) => r.otherUserName === BOT_ROOM_NAME);
          const nonBotRooms = prev.filter(
            (r) => r.otherUserName !== BOT_ROOM_NAME
          );

          const current = nonBotRooms.find((r) => r.roomId === msg.roomId);
          const others = nonBotRooms.filter((r) => r.roomId !== msg.roomId);

          const newRooms = botRoom
            ? [botRoom, current, ...others].filter(Boolean)
            : [current, ...others];
          return newRooms;
        });
      } catch (err) {
        console.error("실시간 메시지 파싱 실패:", err);
      }
    });

    return () => {
      if (subRef.current) {
        console.log("[STOMP] 구독 해제:", topic);
        subRef.current.unsubscribe();
        subRef.current = null;
      }
    };
  }, [selectedChatRoomId]);

  /** 🟩 5️⃣ 자동 스크롤 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** 🟩 6️⃣ 메시지 전송 */
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedChatRoomId) return;
    const body = {
      content: normalizeMessage(currentMessage),
      clientMsgId: Date.now(),
    };

    const client = stompRef.current;
    if (client && client.connected) {
      client.publish({
        destination: `/app/chat.send.${selectedChatRoomId}`,
        body: JSON.stringify(body),
      });

      // ✅ 봇방 절대 고정 정렬
      setChatRooms((prev) => {
        const botRoom = prev.find((r) => r.otherUserName === BOT_ROOM_NAME);
        const nonBotRooms = prev.filter(
          (r) => r.otherUserName !== BOT_ROOM_NAME
        );

        const current = nonBotRooms.find(
          (r) => r.roomId === selectedChatRoomId
        );
        const others = nonBotRooms.filter(
          (r) => r.roomId !== selectedChatRoomId
        );

        return botRoom
          ? [botRoom, current, ...others].filter(Boolean)
          : [current, ...others];
      });

      setCurrentMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } else {
      alert("⚠️ 서버 연결이 끊어졌습니다. 다시 시도해주세요.");
    }
  };

  /** 이미지 경로 처리 */
  const resolveImageUrl = (url) => {
    if (!url) return DEFAULT_AVATAR;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `${BASE_HTTP_URL}${url}`;
    return `${BASE_HTTP_URL}/${url}`;
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
            chatRooms.map((room, idx) => (
              <div
                key={room.roomId}
                className={`${styles.chatRoomItem} ${
                  selectedChatRoomId === room.roomId ? styles.active : ""
                } ${
                  room.otherUserName === BOT_ROOM_NAME ? styles.botRoom : ""
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
                    {room.lastMessage || "메시지가 없습니다."}
                  </div>
                </div>
                <div className={styles.chatRoomMeta}>
                  <span className={styles.chatRoomTime}>
                    {room.lastMessageTime
                      ? new Date(room.lastMessageTime).toLocaleTimeString(
                          "ko-KR",
                          { hour: "2-digit", minute: "2-digit" }
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
          <div className={styles.chatHeader}>
            {selectedRoom ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className={styles.backButton}
                >
                  ←
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
                    { month: "2-digit", day: "2-digit" }
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
                    <React.Fragment
                      key={
                        msg.id ?? `${msg.clientMsgId}:${msg.senderNo}:${idx}`
                      }
                    >
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
