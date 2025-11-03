// src/api/auction.js
import axios from "axios";

export const BASE =
  import.meta.env.VITE_API_BASE || "https://hagglemarket.onrender.com";

export const api = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

export const publicApi = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

export async function whoAmI() {
  const res = await api.get("/api/auth/me");
  return res.data;
}

//요청 인터셉터: 매번 토큰을 읽어서 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken"); // 저장한 위치 맞게 수정
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const isOnLogin = window.location.pathname === "/login";
    const reqUrl = error?.config?.url || "";
    const isAuthCall = reqUrl.startsWith("/api/auth");
    if (status === 401) {
      window.location.href = "/login";
      // 토큰 만료 등: 토큰 제거
      localStorage.removeItem("jwtToken");
      // 이미 로그인 페이지거나, 인증 API 호출이면 추가 리다이렉트 금지
      if (!isOnLogin && !isAuthCall) {
        // replace로 히스토리 누적 방지
        window.location.replace("/login");
      }
    } else if (status === 403) {
      alert("권한이 없습니다. 로그인 상태 또는 권한을 확인하세요.");
      if (!isOnLogin) {
        alert("권한이 없습니다. 로그인 상태 또는 권한을 확인하세요.");
      }
    }
    return Promise.reject(error);
  }
);
// LocalDateTime(스프링) 포맷: YYYY-MM-DDTHH:mm:ss
export function toLocalDateTimeString(datetimeLocalValue) {
  // <input type="datetime-local"> 값은 "YYYY-MM-DDTHH:mm"
  if (!datetimeLocalValue) return "";
  // 초가 없으면 :00 붙여서 스프링 LocalDateTime 파싱 안전화
  return datetimeLocalValue.length === 16
    ? `${datetimeLocalValue}:00`
    : datetimeLocalValue;
}

/** 경매 글 생성 */
export async function createAuctionPost(payload) {
  const body = {
    title: payload.title,
    content: payload.content,
    startCost: Number(payload.startCost),
    buyoutCost:
      payload.buyoutCost !== undefined &&
      payload.buyoutCost !== null &&
      `${payload.buyoutCost}` !== ""
        ? Number(payload.buyoutCost)
        : null,
    startTime: toLocalDateTimeString(payload.startTime), // "YYYY-MM-DDTHH:mm:ss"
    endTime: toLocalDateTimeString(payload.endTime),
    categoryId: Number(payload.categoryId),
  };

  // 필요시 디버그
  // console.log('[createAuctionPost] body =', body);

  const res = await api.post("/api/auction/create", body, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; // { auctionId, message }
}

//수정 API
export async function updateAuctionPost(auctionId, payload) {
  const res = await api.put(`/api/auction/${auctionId}`, payload);
  return res.data; // { auctionId, message }
}

/** 이미지 업로드 (최대 12장) + 정렬 순서 */
export async function uploadAuctionImages(auctionId, files, sortOrder) {
  const fd = new FormData();

  // ✅ 디버그 로그: 전달 직전 무엇을 넣는지 확인
  console.log("[uploadAuctionImages] auctionId=", auctionId);
  console.log(
    "[uploadAuctionImages] files=",
    files?.map((f) => ({ name: f.name, size: f.size, type: f.type }))
  );
  console.log("[uploadAuctionImages] sortOrder=", sortOrder);

  // ✅ 파일 반복 append (이름은 서버 DTO/컨트롤러와 꼭 동일!)
  files.forEach((f, i) => {
    fd.append("images", f, f.name); // <-- 핵심
  });

  // ✅ 순서도 반복 append
  if (Array.isArray(sortOrder)) {
    sortOrder.forEach((ord) => fd.append("sortOrder", String(ord)));
  }

  // ✅ FormData 내부 최종 점검용 로그
  for (const [k, v] of fd.entries()) {
    console.log(
      "[uploadAuctionImages] FD",
      k,
      v instanceof File ? `(file:${v.name}, ${v.size})` : v
    );
  }

  const res = await api.post(`/api/auction/images/${auctionId}`, fd, {
    // 여기서 Content-Type 자동 설정되도록 절대 수동 지정하지 마세요.
    onUploadProgress: (e) => {
      // 진행률 로그(선택)
      const percent = e.total ? Math.round((e.loaded / e.total) * 100) : null;
      if (percent != null) console.log(`[upload] ${percent}%`);
    },
  });
  return res.data;
}

export async function fetchAuctionDetail(auctionId) {
  try {
    const res = await api.get(`/api/auction/${auctionId}`);
    return res.data;
  } catch (e) {
    console.error("[DETAIL FAIL]", {
      status: e?.response?.status,
      data: e?.response?.data,
      url: `${BASE}/api/auction/${auctionId}`,
    });
    throw e;
  }
}

export async function placeBid(auctionId, amount) {
  // 서버가 BidRequestDTO(auctionId, bidAmount)를 받음
  const res = await api.post(`/api/auction/${auctionId}/bid`, {
    auctionId,
    bidAmount: Number(amount),
  });
  return res.data; // BidResponseDTO
}

export async function buyout(auctionId) {
  const res = await api.post(`/api/auction/${auctionId}/buyout`);
  return res.data; // BidResponseDTO
}

export async function fetchHotAuctions({ page = 0, size = 12 } = {}) {
  // 공개 목록이면 publicApi로 호출(토큰/401 리다이렉트 방지)
  const res = await publicApi.get("/api/auction/hot", {
    params: { page, size },
  });
  return res.data; // Spring Page<HotAuctionItemDTO>
}

export async function fetchBidHistory(
  auctionId,
  { page = 0, size = 20, sort = "bidTime,DESC" } = {}
) {
  const res = await api.get(`/api/auction/${auctionId}/bids`, {
    params: { page, size, sort },
  });
  return res.data; // Spring Page<BidHistoryItemDTO>
}
