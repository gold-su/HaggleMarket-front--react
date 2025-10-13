import axios from 'axios';

export async function getMyShop() {
  const { data } = await axios.get('/api/shops/me');      // JWT 인터셉터가 있으면 자동 첨부
  return data;
}
export async function updateMyShop(payload) {
  return axios.put('/api/shops/me', payload);
}
export async function getShopStats(userNo) {
  const { data } = await axios.get(`/api/shops/${userNo}/stats`);
  return data;
}
export async function getShopProducts(userNo, { page = 0, size = 12, sort = 'latest', type = 'used' } = {}) {
  const { data } = await axios.get(`/api/shops/${userNo}/products`, {
    params: { page, size, sort, type },
  });
  return data; // { content, page, size, totalElements, totalPages }
}