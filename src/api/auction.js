// src/api/auction.js
import axios from 'axios';

export const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export const api = axios.create({
    baseURL: BASE,
    headers: { Accept: 'application/json' },
    timeout: 15000,
});

export async function whoAmI() {
    const res = await api.get('/api/auth/me');
    return res.data;
}

//요청 인터셉터: 매번 토큰을 읽어서 헤더에 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken'); // 저장한 위치 맞게 수정
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            window.location.href = '/login';
        } else if (status === 403) {
            alert('권한이 없습니다. 로그인 상태 또는 권한을 확인하세요.');
        }
        return Promise.reject(error);
    }
);
// LocalDateTime(스프링) 포맷: YYYY-MM-DDTHH:mm:ss
export function toLocalDateTimeString(datetimeLocalValue) {
    // <input type="datetime-local"> 값은 "YYYY-MM-DDTHH:mm"
    if (!datetimeLocalValue) return '';
    // 초가 없으면 :00 붙여서 스프링 LocalDateTime 파싱 안전화
    return datetimeLocalValue.length === 16
        ? `${datetimeLocalValue}:00`
        : datetimeLocalValue;
}

/** 경매 글 생성 */
export async function createAuctionPost({ title, content, startCost, buyoutCost, startTime, endTime, userNo }) {
    const body = {
        title,
        content,
        startCost: Number(startCost),
        buyoutCost: buyoutCost ? Number(buyoutCost) : null,
        startTime: toLocalDateTimeString(startTime),
        endTime: toLocalDateTimeString(endTime),
    };
    const res = await api.post('/api/auction/create', body);
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
    files.forEach((f) => fd.append('images', f));
    if (Array.isArray(sortOrder) && sortOrder.length === files.length) {
        sortOrder.forEach((ord) => fd.append('sortOrder', String(ord)));
    }
    const res = await api.post(`/api/auction/images/${auctionId}`, fd);
    return res.data; // { count, images: [{imageId, imageUrl, ...}] }
}

export async function fetchAuctionDetail(auctionId) {
    const res = await api.get(`/api/auction/${auctionId}`);
    return res.data;
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