import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ShopCSS/MyShopContainer.css";
import "../ShopCSS/MyShopHeader.css";
import "../ShopCSS/MyShopNavigation.css";
import "../ShopCSS/MyShopContent.css";

/* ====== 설정(엔드포인트 경로는 프로젝트에 맞게 필요시 바꿔주세요) ====== */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const USED_LIST_URL = (userNo) => `/api/shops/${userNo}/products?type=used`;   // 내 중고
const AUCTION_LIST_URL = (userNo) => `/api/shops/${userNo}/products?type=auction`; // 내 경매(프로젝트에 없는 경우 맞는 URL로 교체)
const LIKES_URL = `/api/products/likes/sidebar`;                               // 찜(중고+경매 통합)
const DELETE_USED_URL = (id) => `/api/products/${id}`;
const DELETE_AUCTION_URL = (id) => `/api/auction/${id}`;
const EDIT_USED_PATH = (id) => `/products/edit/${id}`;
const EDIT_AUCTION_PATH = (id) => `/auction/edit/${id}`;
const DETAIL_USED_PATH = (id) => `/products/detail/${id}`;
const DETAIL_AUCTION_PATH = (id) => `/auction/detail/${id}`;

/* ====== 유틸 ====== */
const looksNumeric = (v) => /^\d+$/.test(String(v ?? ""));
const isAuctionItem = (obj) =>
  Boolean(
    obj?.isAuction ||
    obj?.auction === true ||
    obj?.type === "AUCTION" ||
    obj?.kind === "AUCTION" ||
    obj?.category === "AUCTION" ||
    obj?.auctionId != null
  );

const normalizePrice = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === "object") return normalizePrice(v?.amount ?? v?.value ?? null);
  return null;
};

const getPriceNumber = (p, auction = false) => {
  const auctionKeys = ["currentPrice", "currentCost", "highestBid", "price", "startPrice", "startCost", "minPrice", "cost"];
  const usedKeys = ["price", "sellingPrice", "amount", "priceWon", "cost"];
  const keys = auction ? auctionKeys : usedKeys;
  for (const k of keys) {
    const n = normalizePrice(p?.[k]);
    if (n != null) return n;
  }
  return 0;
};

const resolveThumb = (obj) => {
  const raw =
    obj?.thumbnailUrl ??
    obj?.imageUrl ??
    obj?.thumbnail ??
    (obj?.firstImageId != null ? String(obj.firstImageId) : null);

  if (!raw) return "/no-image.png";

  // ✅ 숫자면 -> 경매 이미지 API 호출
  if (/^\d+$/.test(String(raw))) {
    return `${API_BASE}/api/auction/images/${raw}`;
  }

  // ✅ 절대경로면 그대로
  if (raw.startsWith("http")) return raw;

  // ✅ 업로드된 중고상품 이미지
  if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;

  // ✅ 일반 파일명(jpg, png 등)
  if (/\.(jpg|jpeg|png|gif)$/i.test(raw)) {
    return `${API_BASE}/upload/profile/${raw}`;
  }

  return `${API_BASE}${raw}`;
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toISOString().slice(0, 10);
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3EStore%3C/text%3E%3C/svg%3E";

/* ====== 드롭다운 ====== */
function FilterDropdown({ value, onChange }) {
  return (
    <div style={{ marginLeft: "auto" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #ddd",
          outline: "none",
        }}
      >
        <option value="ALL">전체</option>
        <option value="USED">중고</option>
        <option value="AUCTION">경매</option>
      </select>
    </div>
  );
}

export default function MyShop() {
  const navigate = useNavigate();

  // axios
  const api = useMemo(() => {
    const _api = axios.create({ baseURL: API_BASE, timeout: 15000 });
    _api.interceptors.request.use((config) => {
      const token = localStorage.getItem("jwtToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return _api;
  }, []);

  /* ====== 상태 ====== */
  const [profile, setProfile] = useState({
    userNo: null,
    storeName: "상점",
    profileImage: PLACEHOLDER,
    isVerified: false,
    storeOpenedAt: "-",
    storeVisits: 0,
    salesCount: 0,
    description: "",
  });
  const [stats, setStats] = useState(null);

  const [activeTab, setActiveTab] = useState("내 상품"); // 상품 / 찜 / 내 상품
  const [filter, setFilter] = useState("ALL"); // ALL / USED / AUCTION

  // 데이터
  const [usedList, setUsedList] = useState([]);       // 내 중고
  const [auctionList, setAuctionList] = useState([]); // 내 경매
  const [likesList, setLikesList] = useState([]);     // 찜(혼합)

  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* ====== 로드 ====== */
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get("/api/shops/me");
        const s = await api.get(`/api/shops/${me.data.userNo}/stats`);
        setProfile((prev) => ({
          ...prev,
          userNo: me.data.userNo,
          storeName: me.data.nickname ? `${me.data.nickname}의 상점` : prev.storeName,
          profileImage: me.data.profileUrl || prev.profileImage,
          isVerified: !!me.data.verified,
          description: me.data.intro || prev.description,
          storeOpenedAt: me.data.storeOpenedAt ?? s.data.storeOpenedAt ?? "-",
        }));
        setStats(s.data);

        // 기본 탭: 상품 → 중고+경매 둘 다 로드
        await Promise.all([loadUsed(me.data.userNo), loadAuction(me.data.userNo)]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [api]);

  const loadUsed = async (userNo) => {
    if (!userNo) return;
    setLoading(true);
    try {
      const { data } = await api.get(USED_LIST_URL(userNo));
      setUsedList(data?.content ?? data ?? []);
    } catch (e) {
      console.error(e);
      setUsedList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAuction = async (userNo) => {
    if (!userNo) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/shops/${userNo}/products?type=auction`);
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
          ? data
          : [];
      setAuctionList(list);
    } catch (e) {
      console.error("❌ 경매 목록 로드 실패", e);
      setAuctionList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLikes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(LIKES_URL, { params: { limit: 100 } });
      const items = (data ?? []).map((d) => ({
        ...d,
        id: d.postId ?? d.auctionId ?? d.id,
        isAuction: !!d.isAuction || d.auctionId != null || isAuctionItem(d),
        thumbnailUrl:
          d.thumbnailUrl ??
          d.imageUrl ??
          d.thumbnail ??
          (d.firstImageId != null ? String(d.firstImageId) : null),
      }));
      setLikesList(items);
    } catch (e) {
      console.error(e);
      setLikesList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ====== 프로필/버튼 ====== */
  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = PLACEHOLDER;
  };
  const onChangeProfileImageClick = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setProfile((prev) => ({ ...prev, profileImage: reader.result }));
    reader.readAsDataURL(file);
  };
  const goMyPage = () => navigate("/mypage");

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    if (tab === "내 상품") {
      await Promise.all([loadUsed(profile.userNo), loadAuction(profile.userNo)]);
    } else if (tab === "찜") {
      await loadLikes();
    }
  };

  /* ====== CRUD (내 상품 탭) ====== */
  const onEdit = (item) => {
    const auc = isAuctionItem(item);
    navigate(auc ? EDIT_AUCTION_PATH(item.auctionId ?? item.id) : EDIT_USED_PATH(item.postId ?? item.id));
  };

  const onDelete = async (item) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const auc = isAuctionItem(item);
    const id = item.auctionId ?? item.id ?? item.postId;
    try {
      await api.delete(auc ? DELETE_AUCTION_URL(id) : DELETE_USED_URL(id));
      // 목록 갱신
      await Promise.all([loadUsed(profile.userNo), loadAuction(profile.userNo)]);
      alert("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  /* ====== 뷰 데이터(필터 반영) ====== */
  const combinedMine = useMemo(() => {
    // 상품/내 상품 탭에서 공통으로 사용
    const u = (usedList ?? []).map((p) => ({ ...p, _isAuction: false, id: p.postId ?? p.id }));
    const a = (auctionList ?? []).map((p) => ({ ...p, _isAuction: true, id: p.auctionId ?? p.id }));
    let rows = [...u, ...a];
    if (filter === "USED") rows = rows.filter((x) => !x._isAuction);
    if (filter === "AUCTION") rows = rows.filter((x) => x._isAuction);
    return rows;
  }, [usedList, auctionList, filter]);

  const filteredLikes = useMemo(() => {
    let rows = likesList ?? [];
    if (filter === "USED") rows = rows.filter((x) => !isAuctionItem(x));
    if (filter === "AUCTION") rows = rows.filter((x) => isAuctionItem(x));
    return rows;
  }, [likesList, filter]);

  function Card({ item, withActions = false }) {
    const auc = isAuctionItem(item) || item._isAuction;
    const id = item.auctionId ?? item.id ?? item.postId;
    const imageSrc = resolveThumb(item);
    const price = getPriceNumber(item, auc);
    const goDetail = () => navigate(auc ? DETAIL_AUCTION_PATH(id) : DETAIL_USED_PATH(id));

    const [menuOpen, setMenuOpen] = useState(false);

    return (
      <div
        className="myshop-card"
        style={{
          position: "relative",
          border: "1px solid #eee",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          cursor: "pointer",
        }}
        onClick={goDetail}
      >
        <img
          src={imageSrc}
          alt={item.title}
          onError={onImgError}
          style={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
        <div style={{ padding: 10 }}>
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.3,
              marginBottom: 6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.title}
          </div>

          {/* 가격 + 점 메뉴 영역 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600 }}>
              {price.toLocaleString()}원{" "}
              {auc && (
                <span style={{ marginLeft: 6, fontSize: 12, color: "#888" }}>경매</span>
              )}
            </div>

            {withActions && (
              <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                    color: "#888",
                    lineHeight: 1,
                  }}
                >
                  ⋯
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "24px",
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 90,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(item);
                      }}
                      style={{
                        padding: "8px 10px",
                        border: "none",
                        background: "#fff",
                        textAlign: "left",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      ✏ 수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(item);
                      }}
                      style={{
                        padding: "8px 10px",
                        border: "none",
                        background: "#fff",
                        textAlign: "left",
                        fontSize: 14,
                        color: "#ff5a5a",
                        cursor: "pointer",
                      }}
                    >
                      🗑 삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const Grid = ({ items, withActions = false }) => {
    if (loading) return <p>로딩 중…</p>;
    if (!items?.length) return <p>표시할 상품이 없습니다.</p>;
    return (
      <div
        className="myshop-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          width: "100%",
        }}
      >
        {items.map((it) => (
          <Card key={`${isAuctionItem(it) || it._isAuction ? "a" : "p"}-${it.auctionId ?? it.id ?? it.postId}`} item={it} withActions={withActions} />
        ))}
      </div>
    );
  };

  /* ====== 렌더 ====== */
  return (
    <section className="myshop-container">
      <div className="myshop-store-header">
        <div className="myshop-profile-image-wrapper">
          <img
            src={profile.profileImage}
            alt="상점 프로필"
            className="myshop-profile-image"
            onError={onImgError}
          />

          {/* ✅ 프로필 사진 아래 항상 보이도록 유지 */}
          <div className="myshop-buttons">
            <button className="myshop-mypage-btn" onClick={goMyPage}>
              마이페이지
            </button>
          </div>

          <div className="myshop-profile-image-overlay" onClick={onChangeProfileImageClick}>
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
          <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} style={{ display: "none" }} />
        </div>

        <div className="myshop-store-details">
          <h1 className="myshop-store-name">
            {profile.storeName}
            {profile.isVerified && <span className="myshop-verified-badge">본인인증 완료</span>}
          </h1>
          <div className="myshop-store-stats">
            <span>상점오픈일 {fmtDate(profile.storeOpenedAt)}</span>
            <span>상점방문수 {profile.storeVisits}명</span>
            <span>상품판매 {profile.salesCount}회</span>
          </div>
          <p className="myshop-store-description">
            {profile.description || "앱에서 가게 소개 작성하고 신뢰도를 높여 보세요."}
          </p>
        </div>
      </div>

      <nav className="myshop-nav" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ul style={{ display: "flex", gap: 16 }}>
          <li className={activeTab === "내 상품" ? "active" : ""} onClick={() => handleTabClick("내 상품")}>
            내 상품 {stats?.totalProducts ?? 0}
          </li>
          <li className={activeTab === "찜" ? "active" : ""} onClick={() => handleTabClick("찜")}>
            찜
          </li>
        </ul>
        <FilterDropdown value={filter} onChange={setFilter} />
      </nav>


      <div className="myshop-content">
        {activeTab === "찜" && <Grid items={filteredLikes} />}
        {activeTab === "내 상품" && <Grid items={combinedMine} withActions />}
      </div>
    </section>
  );
}
