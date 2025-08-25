// src/Chat/ChatPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../ChatCSS/ChatPage.module.css';

// 개행 보존 + 문장부호 줄튀김 방지
const normalizeMessage = (raw) => {
  if (!raw) return '';
  let s = String(raw).replace(/\r\n/g, '\n');
  s = s.replace(/[ \t]+\n/g, '\n');
  s = s.replace(/\n([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g, ' $1');
  s = s.replace(/([^\s])\s+([!?.,…~\u3002\uFF01\uFF1F\uFF0C\uFF0E]+)/g, '$1\u00A0$2');
  return s;
};

// 별점 표시
function StarRating({ rating = 0, count = 0 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className={styles.starWrap} aria-label={`평점 ${rating}점, 리뷰 ${count}개`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} className={styles.star}>★</span>
      ))}
      {half && <span className={`${styles.star} ${styles.starHalf}`}>★</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className={`${styles.star} ${styles.starEmpty}`}>★</span>
      ))}
      <span className={styles.starText}>{rating.toFixed(1)} ({count})</span>
    </div>
  );
}

function ChatPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 더미 채팅방 목록(상점/상품 정보/평점 포함)
  const [chatRooms, setChatRooms] = useState([
    {
      id: 'room1',
      storeName: '아이폰매입119',
      otherUser: '판매자 A',
      lastMessage: '네, 가능합니다.',
      lastMessageTime: '15:30',
      unreadCount: 2,
      profileImage: 'https://via.placeholder.com/50?text=A',
      rating: 4.6,
      reviewCount: 128,
      product: {
        id: 'p-iphone-12',
        title: '아이폰 12 128GB 블랙',
        price: 987654,
        image: 'https://via.placeholder.com/120?text=iPhone12',
        badges: ['무료배송', '직거래 가능'],
      },
    },
    {
      id: 'room2',
      storeName: '해글샵',
      otherUser: '구매자 B',
      lastMessage: '언제쯤 배송되나요?',
      lastMessageTime: '어제',
      unreadCount: 0,
      profileImage: 'https://via.placeholder.com/50?text=B',
      rating: 4.2,
      reviewCount: 54,
      product: null,
    },
    {
      id: 'room3',
      storeName: '테크샵',
      otherUser: '매입자 C',
      lastMessage: '가격 조정 문의드립니다.',
      lastMessageTime: '07/28',
      unreadCount: 1,
      profileImage: 'https://via.placeholder.com/50?text=C',
      rating: 3.8,
      reviewCount: 23,
      product: {
        id: 'p-switch',
        title: '닌텐도 스위치 OLED',
        price: 299000,
        image: 'https://via.placeholder.com/120?text=Switch',
        badges: ['상태 양호'],
      },
    },
  ]);

  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  // 우측 헤더 ⋯ 메뉴
  const [moreOpenHeader, setMoreOpenHeader] = useState(false);
  // 좌측 목록 상단 “더보기”
  const [listMoreOpen, setListMoreOpen] = useState(false);

  // 차단 목록
  const [blockedRooms, setBlockedRooms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('blockedRooms') || '[]'); } catch { return []; }
  });

  // “차단한 상점 관리” 모달
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [selectedUnblockIds, setSelectedUnblockIds] = useState([]);

  const selectedRoom = useMemo(
    () => chatRooms.find(r => r.id === selectedChatRoomId) || null,
    [chatRooms, selectedChatRoomId]
  );

  // 방 선택 시 메시지 로드(상품 카드 포함)
  useEffect(() => {
    if (!selectedChatRoomId) { setMessages([]); return; }
    const base = [
      { id: 1, sender: 'other', type: 'text', text: '안녕하세요.', time: '10:00' },
      { id: 2, sender: 'me', type: 'text', text: '네 안녕하세요!', time: '10:01' },
      { id: 3, sender: 'other', type: 'text', text: '상품에 대해 문의드립니다.', time: '10:02' },
      { id: 4, sender: 'me', type: 'text', text: '어떤 점이 궁금하신가요?', time: '10:03' },
    ];
    const room = chatRooms.find(r => r.id === selectedChatRoomId);
    if (room?.product) {
      base.push({
        id: 5,
        sender: 'other',
        type: 'product',
        product: room.product,
        time: '11:06',
      });
    }
    setMessages(base);
  }, [selectedChatRoomId, chatRooms]);

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
  const handleChange = (e) => { setCurrentMessage(e.target.value); autoResize(); };

  // Enter=전송, Shift+Enter=줄바꿈
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedChatRoomId) return;
    const text = normalizeMessage(currentMessage);
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  // 사진 올리기
  const handlePickImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !selectedChatRoomId) return;
    const imgs = files.slice(0, 5).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      sender: 'me',
      type: 'image',
      image: URL.createObjectURL(f),
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }));
    setMessages(prev => [...prev, ...imgs]);
    e.target.value = '';
  };

  // 상단 행동들
  const onBuyNow = () => {
    if (selectedRoom?.product?.id) {
      navigate(`/product/${selectedRoom.product.id}`);
    } else {
      alert('이 대화에 연결된 상품이 없습니다.');
    }
  };

  // ✅ 차단: chatRooms는 유지하고 렌더에서만 숨김
  const handleBlockRoom = () => {
    if (!selectedChatRoomId) return;
    if (!confirm('상대를 차단하시겠어요? (해당 대화방은 목록에서 숨겨집니다)')) return;
    const next = Array.from(new Set([...(blockedRooms || []), selectedChatRoomId]));
    setBlockedRooms(next);
    localStorage.setItem('blockedRooms', JSON.stringify(next));
    setSelectedChatRoomId(null);
    setMoreOpenHeader(false);
  };

  const handleLeaveRoom = () => {
    if (!selectedChatRoomId) return;
    if (!confirm('대화방을 나가시겠어요?')) return;
    setChatRooms(prev => prev.filter(r => r.id !== selectedChatRoomId));
    // 차단목록에서 정리
    const nextBlocked = (blockedRooms || []).filter(id => id !== selectedChatRoomId);
    setBlockedRooms(nextBlocked);
    localStorage.setItem('blockedRooms', JSON.stringify(nextBlocked));
    setSelectedChatRoomId(null);
    setMoreOpenHeader(false);
  };

  const handleBack = () => navigate(-1);

  // ── 차단 관리 모달 ────────────────────────────────
  const openBlockedModal = () => {
    setSelectedUnblockIds([]);
    setBlockedModalOpen(true);
    setListMoreOpen(false);
  };
  const closeBlockedModal = () => {
    setBlockedModalOpen(false);
    setSelectedUnblockIds([]);
  };
  const toggleSelectId = (id) => {
    setSelectedUnblockIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  // ✅ 전체 선택 / 해제
  const allChecked = blockedRooms.length > 0 && selectedUnblockIds.length === blockedRooms.length;
  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedUnblockIds([]);
    } else {
      setSelectedUnblockIds([...blockedRooms]);
    }
  };

  const handleConfirmUnblockSingle = (id) => {
    const room = chatRooms.find(r => r.id === id);
    const name = room?.storeName || id;
    if (!confirm(`'${name}' 차단을 해제할까요?`)) return;
    const next = (blockedRooms || []).filter(v => v !== id);
    setBlockedRooms(next);
    localStorage.setItem('blockedRooms', JSON.stringify(next));
    setSelectedUnblockIds(prev => prev.filter(v => v !== id));
  };

  const handleBulkUnblock = () => {
    if (selectedUnblockIds.length === 0) return;
    const names = selectedUnblockIds
      .map(id => chatRooms.find(r => r.id === id)?.storeName || id)
      .join(', ');
    if (!confirm(`선택한 ${selectedUnblockIds.length}개(${names})의 차단을 해제할까요?`)) return;
    const next = (blockedRooms || []).filter(id => !selectedUnblockIds.includes(id));
    setBlockedRooms(next);
    localStorage.setItem('blockedRooms', JSON.stringify(next));
    setSelectedUnblockIds([]);
  };
  // ────────────────────────────────────────────────

  // 메시지 타입별 렌더
  const renderMessage = (msg) => {
    if (msg.type === 'product' && msg.product) {
      const p = msg.product;
      return (
        <div className={styles.productBubble}>
          <div className={styles.productRow}>
            {p.image && <img className={styles.productImage} src={p.image} alt="상품" />}
            <div className={styles.productInfo}>
              <div className={styles.productTitle}>{p.title}</div>
              <div className={styles.productPrice}>{Number(p.price || 0).toLocaleString()}원</div>
              {Array.isArray(p.badges) && p.badges.length > 0 && (
                <ul className={styles.productBadges}>
                  {p.badges.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
              <button
                type="button"
                className={styles.productCTA}
                onClick={() => navigate(`/product/${p.id}`)}
              >
                상품상세 보기
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (msg.type === 'image') {
      return (
        <div className={styles.messageBubble}>
          <img className={styles.imageInBubble} src={msg.image} alt="보낸 이미지" />
        </div>
      );
    }
    return <div className={styles.messageBubble}>{msg.text}</div>;
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        {/* 좌측 채팅방 목록 */}
        <div className={styles.chatRoomList}>
          <div className={styles.listHeaderRow}>
            <h2>채팅 목록</h2>
            <div className={styles.listMoreWrap}>
              <button
                type="button"
                className={styles.kebab}
                aria-haspopup="menu"
                aria-expanded={listMoreOpen}
                onClick={() => setListMoreOpen(v => !v)}
              >
                ⋯
              </button>
              {listMoreOpen && (
                <ul className={styles.moreMenu} role="menu">
                  <li role="menuitem">
                    <button type="button" onClick={openBlockedModal}>
                      차단한 상점 관리
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {chatRooms.length === 0 ? (
            <p className={styles.emptyMessage}>채팅 목록이 없습니다.</p>
          ) : (
            chatRooms
              .filter(r => !blockedRooms?.includes(r.id)) // 렌더에서만 숨김
              .map((room) => (
                <div
                  key={room.id}
                  className={`${styles.chatRoomItem} ${selectedChatRoomId === room.id ? styles.active : ''}`}
                  onClick={() => { setSelectedChatRoomId(room.id); setMoreOpenHeader(false); }}
                >
                  <img src={room.profileImage} alt="프로필" className={styles.chatRoomProfile} />
                  <div className={styles.chatRoomDetails}>
                    <div className={styles.chatRoomUser}>{room.storeName || room.otherUser}</div>
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

        {/* 우측 메시지 영역 */}
        <div className={styles.chatMessageArea}>
          {/* 메시지 영역 상단 헤더 */}
          <div className={styles.chatHeader}>
            <button onClick={handleBack} className={styles.backButton} aria-label="뒤로가기">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>

            <div className={styles.headerTitleArea}>
              <div className={styles.storeName}>
                {selectedRoom?.storeName || '상점'}
              </div>
              {selectedRoom && (
                <StarRating rating={selectedRoom.rating || 0} count={selectedRoom.reviewCount || 0} />
              )}
            </div>

            {selectedChatRoomId && (
              <div className={styles.headerActionsRight}>
                <button
                  type="button"
                  className={styles.buyButton}
                  onClick={onBuyNow}
                >
                  구매하기
                </button>
                <div className={styles.moreWrap}>
                  <button
                    type="button"
                    className={styles.kebab}
                    aria-haspopup="menu"
                    aria-expanded={moreOpenHeader}
                    onClick={() => setMoreOpenHeader((v) => !v)}
                  >
                    ⋯
                  </button>
                  {moreOpenHeader && (
                    <ul className={styles.moreMenu} role="menu">
                      <li role="menuitem">
                        <button type="button" onClick={handleBlockRoom}>차단하기</button>
                      </li>
                      <li role="menuitem">
                        <button type="button" onClick={handleLeaveRoom}>대화방 나가기</button>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

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
                      {renderMessage(msg)}
                      <span className={styles.timeBelow}>{msg.time}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 + 사진 올리기 */}
              <div className={styles.chatInputArea}>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="사진 올리기"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePickImage}
                  style={{ display: 'none' }}
                />

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

      {/* ✅ 차단한 상점 관리 모달 */}
      {blockedModalOpen && (
        <div className={styles.modalOverlay} onClick={closeBlockedModal}>
          <div className={styles.blockedModal} onClick={e => e.stopPropagation()}>
            <div className={styles.blockedHeader}>
              <h3>차단한 상점 관리</h3>
              <button type="button" className={styles.modalClose} onClick={closeBlockedModal}>✕</button>
            </div>

            {/* ✅ 전체 선택 영역 */}
            {blockedRooms.length > 0 && (
              <div className={styles.selectAllRow}>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleSelectAll}
                  />
                  전체 선택
                </label>
                <span className={styles.selectAllCount}>
                  {selectedUnblockIds.length}/{blockedRooms.length}
                </span>
              </div>
            )}

            {(!blockedRooms || blockedRooms.length === 0) ? (
              <p className={styles.emptyMessage}>차단한 상점이 없습니다.</p>
            ) : (
              <>
                <ul className={styles.blockedList}>
                  {blockedRooms.map(id => {
                    const room = chatRooms.find(r => r.id === id);
                    const checked = selectedUnblockIds.includes(id);
                    const name = room?.storeName || `(삭제됨) ${id}`;
                    return (
                      <li key={id} className={styles.blockedItem}>
                        <label className={styles.blockedLabel}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectId(id)}
                          />
                          <span className={styles.blockedName}>{name}</span>
                        </label>
                        <button
                          type="button"
                          className={styles.unblockBtn}
                          onClick={() => handleConfirmUnblockSingle(id)}
                        >
                          해제
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className={styles.blockedFooter}>
                  <button
                    type="button"
                    className={styles.bulkUnblockBtn}
                    onClick={handleBulkUnblock}
                    disabled={selectedUnblockIds.length === 0}
                  >
                    선택 해제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;