// src/Shop/MyShop.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../ShopCSS/MyShopContainer.css';
import '../ShopCSS/MyShopHeader.css';
import '../ShopCSS/MyShopNavigation.css';
import '../ShopCSS/MyShopContent.css';

function MyShop() {
  const navigate = useNavigate();

  // 파일 상단 어딘가에 추가
  const normalizePrice = (v) => {
    if (v == null) return null;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const cleaned = v.replace(/[^\d.-]/g, "");
      if (!cleaned) return null;
      const n = Number(cleaned);
      return Number.isNaN(n) ? null : n;
    }
    if (typeof v === "object") {
      return normalizePrice(v.amount ?? v.value ?? null);
    }
    return null;
  };

  const getPriceNumber = (p, mode = "used") => {
    const auctionKeys = ["currentPrice", "price", "highestBid", "startPrice", "minPrice"];
    const usedKeys = ["price", "sellingPrice", "amount", "priceWon"];
    const keys = mode === "auction" ? auctionKeys : usedKeys;
    for (const k of keys) {
      const n = normalizePrice(p?.[k]);
      if (n != null) return n;
    }
    return 0;
  };

  // ✅ 이 페이지 전용 axios 인스턴스
  const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 15000,
  });

  // ✅ 요청마다 토큰 자동 첨부
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ✅ ProductCard와 동일한 이미지 URL 안전 처리
  const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
  const getImageSrc = (obj) => {
    const url = obj?.thumbnailUrl ?? obj?.imageUrl;
    if (!url) return '/no-image.png';
    return url.startsWith('http') ? url : `${BASE}${url}`;
  };

  // 상세 경로(요구한 라우트)
  const PRODUCT_DETAIL_PATH = (id) => `/products/detail/${id}`;

  const PLACEHOLDER =
    "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3EStore%3C/text%3E%3C/svg%3E";

  const [profile, setProfile] = useState({
    userNo: null,
    storeName: '상점',
    profileImage: PLACEHOLDER,
    isVerified: false,
    storeOpenDate: '-',
    storeVisits: 0,
    salesCount: 0,
    description: '',
  });

  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('상품');

  // ▼ 탭 데이터 상태
  const [myProducts, setMyProducts] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 12,
  });
  const [likedItems, setLikedItems] = useState({ content: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // ▼ 내 상품 로드
  const loadMyProducts = async (uNo = profile.userNo, page = 0, size = 12) => {
    if (!uNo) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/shops/${uNo}/products`, {
        params: { page, size, sort: 'latest', type: 'used' },
      });
      setMyProducts({
        content: data?.content ?? [],
        page: data?.page ?? page,
        size: data?.size ?? size,
        totalElements: data?.totalElements ?? (data?.content?.length ?? 0),
        totalPages: data?.totalPages ?? 1,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ▼ 찜 로드
  const loadMyLikes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/likes/sidebar', { params: { limit: 50 } });
      setLikedItems({ content: data ?? [], total: (data ?? []).length });
      // 페이지네이션 API가 있다면 ↑ 대신:
      // const { data } = await api.get('/api/likes/mine', { params: { page:0, size:12 }});
      // setLikedItems({ content: data?.content ?? [], total: data?.totalElements ?? 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get('/api/shops/me');
        const s = await api.get(`/api/shops/${me.data.userNo}/stats`);

        setProfile((prev) => ({
          ...prev,
          userNo: me.data.userNo,
          storeName: me.data.nickname || prev.storeName,
          profileImage: me.data.profileUrl || prev.profileImage,
          isVerified: !!me.data.verified,
          description: me.data.intro || prev.description,
        }));
        setStats(s.data);

        await loadMyProducts(me.data.userNo, 0, 12);
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER; // 네가 쓰던 플레이스홀더 유지
  };

  const handleProfileImageChangeClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile((prev) => ({ ...prev, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };

  const goToProductManagement = () => navigate('/myshop/products');
  const goToMyPage = () => navigate('/mypage');

  const handleTabClick = async (tabName) => {
    setActiveTab(tabName);
    if (tabName === '상품') {
      await loadMyProducts();
    } else if (tabName === '찜') {
      await loadMyLikes();
    }
  };

  // ▼ 리스트 렌더링
  const renderProducts = () => {
    if (loading) return <p>로딩 중…</p>;
    if (!myProducts.content?.length) return <p>등록된 상품이 없습니다.</p>;

    return (
      <div
        className="myshop-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
          width: '100%',
        }}
      >
        {myProducts.content.map((p) => {
          const id = p.postId ?? p.id;
          const imageSrc = getImageSrc(p); // ✅ ProductCard 방식
          return (
            <div
              key={id}
              className="myshop-card"
              style={{
                border: '1px solid #eee',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => id && navigate(PRODUCT_DETAIL_PATH(id))}
            >
              <img
                src={imageSrc}
                alt={p.title}
                onError={handleImgError}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div className="myshop-card-meta" style={{ padding: 10 }}>
                <div
                  className="title"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.3,
                    marginBottom: 6,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {p.title}
                </div>
                <div className="price" style={{ fontWeight: 600 }}>
                  {getPriceNumber(p, "used").toLocaleString()}원
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLikes = () => {
    if (loading) return <p>로딩 중…</p>;
    if (!likedItems.content?.length) return <p>찜한 상품이 없습니다.</p>;

    return (
      <div
        className="myshop-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
          width: '100%',
        }}
      >
        {likedItems.content.map((item) => {
          const id = item.postId ?? item.id;
          const imageSrc = getImageSrc(item); // ✅ ProductCard 방식
          return (
            <div
              key={id}
              className="myshop-card"
              style={{
                border: '1px solid #eee',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => id && navigate(PRODUCT_DETAIL_PATH(id))}
            >
              <img
                src={imageSrc}
                alt={item.title}
                onError={handleImgError}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div className="myshop-card-meta" style={{ padding: 10 }}>
                <div
                  className="title"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.3,
                    marginBottom: 6,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.title}
                </div>
                <div className="price" style={{ fontWeight: 600 }}>
                  {getPriceNumber(item, "used").toLocaleString()}원
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="myshop-container">
      <div className="myshop-store-header">
        <div className="myshop-profile-image-wrapper">
          <img
            src={profile.profileImage}
            alt="상점 프로필"
            className="myshop-profile-image"
            onError={handleImgError}
          />
          <div
            className="myshop-profile-image-overlay"
            onClick={handleProfileImageChangeClick}
          >
            <svg
              className="myshop-camera-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="myshop-buttons">
            <button className="myshop-manage-store-btn" onClick={goToProductManagement}>
              내 상점 관리
            </button>
            <button className="myshop-mypage-btn" onClick={goToMyPage}>
              마이페이지
            </button>
          </div>
        </div>

        <div className="myshop-store-details">
          <h1 className="myshop-store-name">
            {profile.storeName}
            {profile.isVerified && <span className="myshop-verified-badge">본인인증 완료</span>}
          </h1>
          <div className="myshop-store-stats">
            <span>상점오픈일 {profile.storeOpenDate}</span>
            <span>상점방문수 {profile.storeVisits}명</span>
            <span>상품판매 {profile.salesCount}회</span>
          </div>
          <p className="myshop-store-description">
            {profile.description || '앱에서 가게 소개 작성하고 신뢰도를 높여 보세요.'}
          </p>
        </div>
      </div>

      <nav className="myshop-nav">
        <ul>
          <li className={activeTab === '상품' ? 'active' : ''} onClick={() => handleTabClick('상품')}>
            상품 {stats?.totalProducts ?? 0}
          </li>
          <li className={activeTab === '상점후기' ? 'active' : ''} onClick={() => handleTabClick('상점후기')}>
            상점후기 {stats?.reviewCount ?? 0}
          </li>
          <li className={activeTab === '찜' ? 'active' : ''} onClick={() => handleTabClick('찜')}>
            찜 {stats?.totalLikes ?? 0}
          </li>
          <li className={activeTab === '팔로잉' ? 'active' : ''} onClick={() => handleTabClick('팔로잉')}>
            팔로잉 {stats?.following ?? 0}
          </li>
          <li className={activeTab === '팔로워' ? 'active' : ''} onClick={() => handleTabClick('팔로워')}>
            팔로워 {stats?.followers ?? 0}
          </li>
        </ul>
      </nav>

      <div className="myshop-content">
        {activeTab === '상품' && renderProducts()}
        {activeTab === '상점후기' && <p>상점 후기 내용이 여기에 표시됩니다.</p>}
        {activeTab === '찜' && renderLikes()}
        {activeTab === '팔로잉' && <p>팔로잉 목록이 여기에 표시됩니다.</p>}
        {activeTab === '팔로워' && <p>팔로워 목록이 여기에 표시됩니다.</p>}
      </div>
    </section>
  );
}

export default MyShop;
