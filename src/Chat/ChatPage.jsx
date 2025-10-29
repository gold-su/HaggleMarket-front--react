import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../ChatCSS/ChatPage.module.css";
import { fetchChatRooms, fetchChatMessages } from "../api/chat";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = "http://localhost:8080";
const DEFAULT_AVATAR = "/images/default-avatar.jpg";
const BOT_ROOM_NAME = "해글봇 💬";

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

  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  const stompRef = useRef(null);
  const subRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const selectedRoom = useMemo(
    () => chatRooms.find((r) => r.roomId === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  );

  // 1) 방 목록 불러오기 + 챗봇 고정 + 최초 자동 선택
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchChatRooms();
        const botRoom = data.find((r) => r.otherUserName === BOT_ROOM_NAME);
        let sorted = data;
        if (botRoom) {
          sorted = [
            botRoom,
            ...data.filter((r) => r.roomId !== botRoom.roomId),
          ];
        }
        setChatRooms(sorted);

        if (preselectRoomId) {
          setSelectedChatRoomId(Number(preselectRoomId));
        } else if (botRoom) {
          setSelectedChatRoomId(botRoom.roomId);
        }
      } catch (e) {
        console.error("채팅방 불러오기 실패", e);
      }
    })();
  }, [preselectRoomId]);

  // 2) 선택된 방의 기존 메시지 로딩
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

  // 3) STOMP 연결 (앱 생명주기 1회) + 방 바뀔 때마다 구독 재설정
  useEffect(() => {
    // 토큰 가져오기 (accessToken 우선, 없으면 token)
    const token =
      localStorage.getItem("jwtToken") || // ✅ 네 로그인 코드가 저장하는 키
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";

    console.log("[WS] token(len):", token ? token.length : 0);
    // token 앞 10글자 정도만 찍어서 유무 확인
    console.log("[WS] token head:", token ? token.slice(0, 10) : "(none)");

    if (!token) {
      console.warn(
        "[WS] 로컬스토리지에 토큰이 없습니다. CONNECT 헤더가 비어 전송됩니다."
      );
    }

    const sock = new SockJS(`${BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000,
      debug: (str) => console.log("[STOMP]", str),
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      onConnect: () => {
        console.log("[STOMP] 연결 성공");
        // 선택된 방이 이미 있다면 구독
        if (selectedChatRoomId) {
          if (subRef.current) {
            subRef.current.unsubscribe();
            subRef.current = null;
          }
          subRef.current = client.subscribe(
            `/topic/chat.room.${selectedChatRoomId}`,
            (frame) => {
              try {
                const msg = JSON.parse(frame.body);
                setMessages((prev) => [...prev, msg]);
              } catch (err) {
                console.error("실시간 메시지 파싱 실패:", err, frame.body);
              }
            }
          );
        }
      },
      onStompError: (frame) => {
        console.error(
          "[STOMP ERROR] cmd:",
          frame.command,
          "headers:",
          frame.headers,
          "body:",
          frame.body
        );
      },
    });

    client.onStompError = (frame) => {
      console.error(
        "[STOMP] Broker error:",
        frame.headers["message"],
        frame.body
      );
    };
    client.onWebSocketClose = (evt) => {
      console.warn("[STOMP] WebSocket closed", evt);
    };

    client.activate();
    stompRef.current = client;

    return () => {
      try {
        if (subRef.current) {
          subRef.current.unsubscribe();
          subRef.current = null;
        }
      } finally {
        client.deactivate();
        stompRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회만

  // 4) 선택된 방 변경 시 구독만 재설정
  useEffect(() => {
    const client = stompRef.current;
    if (!client || !client.connected) return;

    if (subRef.current) {
      subRef.current.unsubscribe();
      subRef.current = null;
    }
    if (selectedChatRoomId) {
      subRef.current = client.subscribe(
        `/topic/chat.room.${selectedChatRoomId}`,
        (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            setMessages((prev) => [...prev, msg]);
          } catch (err) {
            console.error("실시간 메시지 파싱 실패:", err, frame.body);
          }
        }
      );
    }
  }, [selectedChatRoomId]);

  // 5) 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6) 전송
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
      setCurrentMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } else {
      alert("서버 연결이 끊어졌습니다. 잠시 뒤 다시 시도해주세요.");
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return DEFAULT_AVATAR;
    try {
      if (/^https?:\/\//i.test(url)) return url;
      if (url.startsWith("/")) return `${BASE_URL}${url}`;
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
                    {room.lastMessage || "메시지가 없습니다."}
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
          <div className={styles.chatHeader}>
            {selectedRoom ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className={styles.backButton}
                  aria-label="뒤로가기"
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
