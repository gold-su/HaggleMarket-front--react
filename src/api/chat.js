// src/api/chat.js
import { api } from "./auction"; // 이미 토큰 인터셉터 있는 axios 재활용

/** 채팅방 목록 불러오기 */
export async function fetchChatRooms() {
  const res = await api.get("/api/chat/rooms");
  return res.data.content || res.data; // Page 구조 대응
}

/** 특정 방의 메시지 목록 불러오기 */
export async function fetchChatMessages(roomId, beforeId = null, size = 30) {
  const params = {};
  if (beforeId) params.beforeId = beforeId;
  params.size = size;

  const res = await api.get(`/api/chat/rooms/${roomId}/messages`, { params });
  return res.data.content || res.data;
}

/** 메시지 전송 */
export async function sendChatMessage(
  roomId,
  content,
  clientMsgId = Date.now()
) {
  const body = { content, clientMsgId };
  const res = await api.post(`/api/chat/rooms/${roomId}/messages`, body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

/** 채팅방 생성 (상품/경매 공용) */
export async function createChatRoom({ roomKind, auctionId, postId }) {
  const body = {
    roomKind, // "AUCTION" | "POST" | "ORDER"
  };

  // roomKind에 맞춰 ID 필드만 선택적으로 포함
  if (roomKind === "AUCTION" && auctionId) body.auctionId = auctionId;
  if (roomKind === "POST" && postId) body.postId = postId;

  console.log("[createChatRoom] 보내는 body =", body);

  const res = await api.post("/api/chat/rooms", body, {
    headers: { "Content-Type": "application/json" },
  });

  return res.data;
}

/** 채팅방 상세 (필요시) */
export async function fetchChatRoomDetail(roomId) {
  const res = await api.get(`/api/chat/rooms/${roomId}`);
  return res.data;
}
