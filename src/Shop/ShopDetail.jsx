// src/Shop/ShopDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../ShopCSS/MyShopContainer.css";
import "../ShopCSS/MyShopHeader.css";
import "../ShopCSS/MyShopNavigation.css";
import "../ShopCSS/MyShopContent.css";

/* ====== 설정 ====== */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const USED_LIST_URL = (userNo) => `/api/shops/${userNo}/products?type=used`;
const AUCTION_LIST_URL = (userNo) => `/api/shops/${userNo}/products?type=auction`;
const DETAIL_USED_PATH = (id) => `/products/detail/${id}`;
const DETAIL_AUCTION_PATH = (id) => `/auction/detail/${id}`;
const DEFAULT_AVATAR = "/images/default-avatar.svg";

/* ====== 유틸 ====== */
const isAuctionItem = (obj) =>
  Boolean(
    obj?.isAuction ||
      obj?.auction === true ||
      obj?.type === "AUCTION" ||
      obj?.kind === "AUCTION" ||
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
  if (!raw) return "/no-image.png";
  if (/^\d+$/.test(String(raw))) return `${API_BASE}/api/auction/images/${raw}`;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/uploads/")) return `${API_BASE}${raw}`;
  return `${API_BASE}${raw}`;
};

const daysSince = (dateStr) => {
  if (!dateStr || dateStr === "-") return "-";
  const start = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
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
export default function ShopDetail() {
  const { userNo } = useParams();
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

  const [usedList, setUsedList] = useState([]);
  const [auctionList, setAuctionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  /* ====== 초기 로드 ====== */
  useEffect(() => {
    if (!userNo) return;
    (async () => {
      try {
        const p = await api.get(`/api/shops/${userNo}`);
        setProfile((prev) => ({
          ...prev,
          userNo: p.data.userNo,
          storeName: p.data.nickname
            ? `${p.data.nickname}의 상점`
            : prev.storeName,
          profileUrl:
            !p.data.profileUrl ||
            p.data.profileUrl === "null" ||
            p.data.profileUrl === "undefined"
              ? DEFAULT_AVATAR
              : p.data.profileUrl.startsWith("/uploads/")
              ? `${API_BASE}${p.data.profileUrl}`
              : p.data.profileUrl,
          isVerified: !!p.data.verified,
          description: p.data.intro || prev.description,
          storeOpenedAt: p.data.storeOpenedAt ?? "-",
        }));
        await Promise.all([loadUsed(p.data.userNo), loadAuction(p.data.userNo)]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [userNo]);

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

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_AVATAR;
  };

  /* ====== 카드 ====== */
  function Card({ item }) {
    const auc = isAuctionItem(item) || item._isAuction;
    const id = item.auctionId ?? item.id ?? item.postId;
    const imageSrc = resolveThumb(item);
    const price = getPriceNumber(item, auc);
    const goDetail = () =>
      navigate(auc ? DETAIL_AUCTION_PATH(id) : DETAIL_USED_PATH(id));

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
          <div style={{ fontWeight: 600 }}>
            {price.toLocaleString()}원{" "}
            {auc && (
              <span style={{ marginLeft: 6, fontSize: 12, color: "#888" }}>
                경매
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ====== 필터 ====== */
  const combinedMine = useMemo(() => {
    const u = (usedList ?? []).map((p) => ({ ...p, _isAuction: false }));
    const a = (auctionList ?? []).map((p) => ({ ...p, _isAuction: true }));
    let rows = [...u, ...a];
    if (filter === "USED") rows = rows.filter((x) => !x._isAuction);
    if (filter === "AUCTION") rows = rows.filter((x) => x._isAuction);
    return rows;
  }, [usedList, auctionList, filter]);

  /* ====== 렌더 ====== */
  if (loading) return <p style={{ textAlign: "center" }}>로딩 중…</p>;

  return (
    <section className="myshop-container">
      <div className="myshop-store-header">
        <div className="myshop-profile-image-wrapper">
          <img
            src={
              profile.profileUrl
                ? profile.profileUrl.startsWith("http")
                  ? profile.profileUrl
                  : `${API_BASE}${profile.profileUrl}`
                : DEFAULT_AVATAR
            }
            alt="상점 프로필"
            className="myshop-profile-image"
            onError={onImgError}
          />
        </div>

        <div className="myshop-store-details">
          <h1 className="myshop-store-name">
            {profile.storeName}
            {profile.isVerified && (
              <span className="myshop-verified-badge">본인인증 완료</span>
            )}
          </h1>
          <div className="myshop-store-stats">
            <span>오픈한지 {daysSince(profile.storeOpenedAt)}</span>
            <span>상점방문수 {profile.storeVisits}명</span>
            <span>상품판매 {profile.salesCount}회</span>
          </div>
          <p className="myshop-store-description">
            {profile.description || "판매자가 아직 상점 소개를 작성하지 않았습니다."}
          </p>
        </div>
      </div>

      <nav
        className="myshop-nav"
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <ul style={{ display: "flex", gap: 16 }}>
          <li className="active">판매상품</li>
        </ul>
        <FilterDropdown value={filter} onChange={setFilter} />
      </nav>

      <div className="myshop-content">
        {combinedMine?.length ? (
          <div
            className="myshop-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
              width: "100%",
            }}
          >
            {combinedMine.map((it) => (
              <Card
                key={`${isAuctionItem(it) || it._isAuction ? "a" : "p"}-${
                  it.auctionId ?? it.id ?? it.postId
                }`}
                item={it}
              />
            ))}
          </div>
        ) : (
          <p>등록된 상품이 없습니다.</p>
        )}
      </div>
    </section>
  );
}
