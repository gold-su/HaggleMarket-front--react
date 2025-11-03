// src/services/ProductApi.js
import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://hagglemarket.onrender.com";

//상품 가져오는거 예시
export const fetchUsedList = () =>
  axios
    .get(`${BASE}/api/products?page=0&size=8&sort=createdAt,desc`)
    .then((res) => res.data.content);

//경매 목록 가져오기
export const fetchAuctionList = () =>
  axios.get(`${BASE}/api/auction/list`).then((res) => res.data);
