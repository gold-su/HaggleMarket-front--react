// src/Shop/MyShop.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ShopCSS/MyShopContainer.css";
import "../ShopCSS/MyShopHeader.css";
import "../ShopCSS/MyShopNavigation.css";
import "../ShopCSS/MyShopContent.css";

/* ====== 설정 ====== */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const USED_LIST_URL = (userNo) => `/api/shops/${userNo}/products?type=used`;
const AUCTION_LIST_URL = (userNo) =>
  `/api/shops/${userNo}/products?type=auction`;
const LIKES_URL = `/api/products/likes/sidebar`;
const DELETE_USED_URL = (id) => `/api/products/${id}`;
const DELETE_AUCTION_URL = (id) => `/api/auction/${id}`;
const EDIT_USED_PATH = (id) => `/products/edit/${id}`;
const EDIT_AUCTION_PATH = (id) => `/auction/edit/${id}`;
const DETAIL_USED_PATH = (id) => `/products/detail/${id}`;
const DETAIL_AUCTION_PATH = (id) => `/auction/detail/${id}`;

/* ====== 기본 아바타 ====== */
const DEFAULT_AVATAR = "/images/default-avatar.svg";

/* ====== 유틸 ====== */
const normalizePrice = (v) => {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === "object")
    return normalizePrice(v?.amount ?? v?.value ?? null);
  return null;
};

const getPriceNumber = (p, auction = false) => {
  const auctionKeys = [
    "currentPrice",
    "currentCost",
    "highestBid",
    "price",
    "startPrice",
    "minPrice",
    "cost",
  ];
  const usedKeys = ["price", "sellingPrice", "amount", "cost"];
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

  if (!raw || raw === "null" || raw === "undefined") return "/no-image.png";
  if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
  if (/^\d+$/.test(raw)) return `${API_BASE}/api/auction/images/${raw}`;
  if (raw.startsWith("http")) return raw;
  const id = raw.replace(/\D/g, "");
  if (id) return `${API_BASE}/api/auction/images/${id}`;
  return `${API_BASE}${raw}`;
};


const daysSince = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  return `${diff}일째`;
};


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

/* ====== 메인 ====== */
export default function MyShop() {
  const navigate = useNavigate();

  const api = useMemo(() => {
    const _api = axios.create({ baseURL: API_BASE, timeout: 15000 });
    _api.interceptors.request.use((config) => {
      const token = localStorage.getItem("jwtToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return _api;
  }, []);

  const [editIntro, setEditIntro] = useState(false);
  const [introText, setIntroText] = useState("");

  const [profile, setProfile] = useState({
    userNo: null,
    storeName: "상점",
    profileUrl: DEFAULT_AVATAR,
    isVerified: false,
    storeOpenedAt: "-",
    storeVisits: 0,
    salesCount: 0,
    description: "",
  });

  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("내 상품");
  const [filter, setFilter] = useState("ALL");
  const [usedList, setUsedList] = useState([]);
  const [auctionList, setAuctionList] = useState([]);
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const allItems = [...usedList, ...auctionList];
  const filteredItems = useMemo(() => {
    if (filter === "USED") return usedList;
    if (filter === "AUCTION") return auctionList;
    return allItems;
  }, [filter, usedList, auctionList]);

  const filteredLikesList = useMemo(() => {
    const auctionItems = likesList.filter((i) => i.isAuction);
    const usedItems = likesList.filter((i) => !i.isAuction);

    if (filter === "USED") return usedItems;
    if (filter === "AUCTION") return auctionItems;
    return likesList;
  }, [filter, likesList]);

  const saveIntro = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      await api.put(
        `/api/shops/me/intro`,
        introText,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
        }
      );

      // ✅ 상태만 갱신해서 화면 즉시 반영
      setProfile((prev) => {
        if (prev.description === introText) return prev; // 내용 동일하면 리렌더 안 함
        return { ...prev, description: introText };
      });

      // ✅ 편집 모드 자연스럽게 종료
      setEditIntro(false);
    } catch (e) {
      console.error(e);
      alert("소개글 저장 실패");
    }
  };


  /* ====== 초기 로드 ====== */
  useEffect(() => {
    (async () => {
      try {
        // ✅ 내 상점 기본 정보 (userNo 얻기용)
        const me = await api.get("/api/shops/me");

        // ✅ 상세 프로필 (소개글 intro 포함)
        const detail = await api.get(`/api/shops/${me.data.userNo}`);

        // ✅ 상점 통계
        const s = await api.get(`/api/shops/${me.data.userNo}/stats`);

        // ✅ 상태에 반영
        setProfile((prev) => ({
          ...prev,
          userNo: me.data.userNo,
          storeName: detail.data.nickname
            ? `${detail.data.nickname}의 상점`
            : prev.storeName,
          profileUrl:
            !detail.data.profileUrl ||
              detail.data.profileUrl === "null" ||
              detail.data.profileUrl === "undefined"
              ? DEFAULT_AVATAR
              : detail.data.profileUrl.startsWith("/uploads/")
                ? `${API_BASE}${detail.data.profileUrl}`
                : detail.data.profileUrl,
          isVerified: !!detail.data.verified,
          description: detail.data.intro || prev.description, // ✅ intro 반영
          storeOpenedAt:
            detail.data.storeOpenedAt ?? s.data.storeOpenedAt ?? "-",
          visitCount: detail.data.visitCount ?? 0,
        }));

        setStats(s.data);

        // ✅ 상품 목록 불러오기
        await Promise.all([
          loadUsed(me.data.userNo),
          loadAuction(me.data.userNo),
        ]);
      } catch (e) {
        console.error("❌ 상점 정보 불러오기 실패", e);
      }
    })();
  }, []);

  /* ====== 로드 함수 ====== */
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
      const { data } = await api.get(AUCTION_LIST_URL(userNo));
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
      }));
      setLikesList(items);
    } catch (e) {
      console.error(e);
      setLikesList([]);
    } finally {
      setLoading(false);
    }
  };

  /* ====== 이미지 에러 핸들러 ====== */
  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_AVATAR;
  };

  /* ====== 탭 전환 ====== */
  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    if (tab === "내 상품") {
      await Promise.all([
        loadUsed(profile.userNo),
        loadAuction(profile.userNo),
      ]);
    } else if (tab === "찜") {
      await loadLikes();
    }
  };

  const isAuctionItem = useCallback((obj) => {
    if (!obj) return false;
    return Boolean(
      obj?.isAuction === true ||
      obj?.auction === true ||
      obj?.type === "AUCTION" ||
      obj?.kind === "AUCTION" ||
      obj?.auctionId != null ||
      obj?.endTime || // 경매 데이터는 보통 endTime 있음
      obj?.endsAt ||
      obj?.bidCount != null ||
      obj?.startCost != null // 시작가가 있으면 거의 100% 경매
    );
  }, []);


  /* ====== 삭제/수정 ====== */
  const onEdit = (item) => {
    const auc = isAuctionItem(item);
    const targetId = item.auctionId ?? item.id ?? item.postId;
    console.log("🟡 수정 이동 시 ID:", targetId, "isAuction:", auc);

    if (!targetId) {
      alert("⚠️ 수정할 ID를 찾을 수 없습니다.");
      return;
    }

    navigate(auc ? `/auction/edit/${targetId}` : `/products/edit/${targetId}`);
  };

  const onDelete = async (item) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const auc = isAuctionItem(item);
    const id = item.auctionId ?? item.id ?? item.postId;
    try {
      await api.delete(auc ? DELETE_AUCTION_URL(id) : DELETE_USED_URL(id));
      await Promise.all([
        loadUsed(profile.userNo),
        loadAuction(profile.userNo),
      ]);
      alert("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  /* ====== 카드/그리드 ====== */
  const Card = React.memo(function Card({ item, withActions = false }) {
    const auc = isAuctionItem(item) || item._isAuction;
    const id = item.auctionId ?? item.id ?? item.postId;
    const imageSrc = resolveThumb(item);
    const price = getPriceNumber(item, auc);
    const goDetail = () =>
      navigate(auc ? DETAIL_AUCTION_PATH(id) : DETAIL_USED_PATH(id));

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
                <span style={{ marginLeft: 6, fontSize: 12, color: "#888" }}>
                  경매
                </span>
              )}
            </div>
            {withActions && (
              <div
                style={{ position: "relative" }}
                onClick={(e) => e.stopPropagation()}
              >
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
  });

  const Grid = React.memo(({ items, withActions = false }) => {
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
          <Card
            key={`${isAuctionItem(it) || it._isAuction ? "a" : "p"}-${it.auctionId ?? it.id ?? it.postId
              }`}
            item={it}
            withActions={withActions}
          />
        ))}
      </div>
    );
  });

  /* ====== 렌더 ====== */
  return (
    <section className="myshop-container">
      <div className="myshop-store-header">
        <img
          src={
            profile.profileUrl
              ? profile.profileUrl.startsWith("http")
                ? profile.profileUrl
                : profile.profileUrl.startsWith("/uploads/")
                  ? `${API_BASE}${profile.profileUrl}`
                  : profile.profileUrl // ✅ API_BASE 제거
              : "/images/default-avatar.svg"
          }
          alt="상점 프로필"
          className="myshop-profile-image"
          onError={onImgError}
        />

        <div className="myshop-store-details">
          <h1 className="myshop-store-name">
            {profile.storeName}
            {profile.isVerified && (
              <span className="myshop-verified-badge">본인인증 완료</span>
            )}
          </h1>
          <div className="myshop-store-stats">
            <span>오픈한지 {daysSince(profile.storeOpenedAt)}</span>
            <span>상점방문수 {profile.visitCount ?? 0}명</span>
            <span>상품판매 {profile.salesCount}회</span>
          </div>
          <div className="myshop-store-description">
            {editIntro ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  placeholder="소개글을 입력하세요"
                  style={{
                    width: "100%",
                    minHeight: 80,
                    resize: "none",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={saveIntro}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "#007bff",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditIntro(false)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "#eee",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ margin: 0 }}>
                  {profile.description ||
                    "앱에서 가게 소개 작성하고 신뢰도를 높여 보세요."}
                </p>
                <button
                  onClick={() => {
                    setIntroText(profile.description || "");
                    setEditIntro(true);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#007bff",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  ✏ 수정
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav
        className="myshop-nav"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <ul style={{ display: "flex", gap: 16 }}>
          <li
            className={activeTab === "내 상품" ? "active" : ""}
            onClick={() => handleTabClick("내 상품")}
          >
            내 상품 {stats?.totalProducts ?? 0}
          </li>
          <li
            className={activeTab === "찜" ? "active" : ""}
            onClick={() => handleTabClick("찜")}
          >
            찜
          </li>
        </ul>
        <FilterDropdown value={filter} onChange={setFilter} />
      </nav>

      <div className="myshop-content">
        {activeTab === "찜" && <Grid items={filteredLikesList} />}
        {activeTab === "내 상품" && <Grid items={filteredItems} withActions />}
      </div>
    </section>
  );
}
