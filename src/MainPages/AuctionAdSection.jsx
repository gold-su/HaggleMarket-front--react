// src/components/AuctionAdSection.jsx
import React, { useState, useRef, useEffect } from "react";
import "../MainPagesCSS/auctionadsection.css";
import { fetchHotAuctions, BASE } from "../api/auction";
import { useNavigate } from "react-router-dom";

function AuctionAdSection() {
  const auctionContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();
  /* ✅ 수정됨: 실제 fetch 대신 테스트용 더미데이터 추가 */
  const [auctionItems, setAuctionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const money = (n) => Number(n ?? 0).toLocaleString("ko-KR");
  const absUrl = (url) =>
    !url
      ? "https://via.placeholder.com/280x180?text=No+Image"
      : url.startsWith("http")
      ? url
      : `${BASE}${url}`;
  const formatRemain = (endIso, nowMs) => {
    if (!endIso) return "";
    const diff = new Date(endIso).getTime() - nowMs;
    if (diff <= 0) return "종료";
    const total = Math.floor(diff / 1000);
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (v) => String(v).padStart(2, "0");
    return d > 0
      ? `${d}일 ${pad(h)}:${pad(m)}:${pad(s)} 남음`
      : `${pad(h)}:${pad(m)}:${pad(s)} 남음`;
  };
  // ✅ 수정됨: 남은 시간 실시간 갱신 (setInterval 안정화)
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleFavorite = (id) => {
    setAuctionItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const updateScrollButtons = () => {
    const root = auctionContainerRef.current;
    if (!root) return;
    const { scrollLeft, scrollWidth, clientWidth } = root;
    const eps = 2;
    setCanScrollLeft(scrollLeft > eps);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - eps);
  };

  const scrollOne = (dir = 1) => {
    const root = auctionContainerRef.current;
    if (!root) return;
    const firstCard = root.querySelector(".auction-item");
    const styles = window.getComputedStyle(root);
    const gap = parseInt(styles.columnGap || styles.gap || "20", 10);
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
    const delta = dir * (cardWidth + gap);
    root.scrollBy({ left: delta, behavior: "smooth" });
  };

  // 🔧 [TEST DATA START] — API 대신 임시 데이터
  const mockData = [
    {
      id: 101,
      title: "애플 맥북 프로 16인치",
      description: "M2 프로칩 / 16GB / 1TB SSD",
      price: money(2200000) + "원",
      imageUrl: "https://via.placeholder.com/280x180?text=MacBook",
      endIso: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(), // 5시간 남음
      bidCount: 12,
      isFavorite: false,
    },
    {
      id: 102,
      title: "삼성 QLED 55인치 TV",
      description: "4K UHD / HDR10+ 지원",
      price: money(980000) + "원",
      imageUrl: "https://via.placeholder.com/280x180?text=Samsung+TV",
      endIso: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(), // 1시간 남음
      bidCount: 7,
      isFavorite: true,
    },
    {
      id: 103,
      title: "닌텐도 스위치 OLED",
      description: "화이트 / 패키지 미개봉",
      price: money(380000) + "원",
      imageUrl: "https://via.placeholder.com/280x180?text=Nintendo",
      endIso: new Date(Date.now() + 1000 * 60 * 20).toISOString(), // 20분 남음
      bidCount: 3,
      isFavorite: false,
    },
    {
      id: 104,
      title: "아이패드 프로 12.9 (6세대)",
      description: "256GB / 스페이스그레이",
      price: money(1350000) + "원",
      imageUrl: "https://via.placeholder.com/280x180?text=iPad+Pro",
      endIso: new Date(Date.now() + 1000 * 60 * 2).toISOString(), // 2분 남음
      bidCount: 5,
      isFavorite: false,
    },
  ];
  // 🔧 [TEST DATA END]

  // 🔧 [TEST MODE] — 실제 fetchHotAuctions 비활성화, mock 데이터 사용
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAuctionItems(mockData);
      setLoading(false);
    }, 500); // 로딩 흉내
  }, []);
  // 실제 서버 연동 시 아래 주석 해제
  /*
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const page = await fetchHotAuctions({ page: 0, size: 12 });
        if (cancelled) return;
        const mapped = page.content.map((it) => ({
          id: it.auctionId,
          title: it.title,
          description: "",
          price: `${money(it.currentPrice)}원`,
          imageUrl: absUrl(it.thumbnailUrl),
          endIso: it.endTime,
          isFavorite: false,
          bidCount: Number(it.bidCount ?? 0),
        }));
        setAuctionItems(mapped);
        requestAnimationFrame(updateScrollButtons);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  */

  useEffect(() => {
    updateScrollButtons();
    const root = auctionContainerRef.current;
    if (!root) return;
    root.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      root.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [auctionItems.length]);

  return (
    <section className="auction-ad-section">
      <h2>현재 베스트 경매 목록</h2>
      {loading && <div style={{ color: "#666" }}>불러오는 중…</div>}
      {error && <div style={{ color: "#ef4444" }}>목록을 불러오지 못했습니다.</div>}

      <div className="auction-items-wrapper">
        <button
          className="scroll-button scroll-button-left"
          onClick={() => scrollOne(-1)}
          disabled={!canScrollLeft}
          aria-label="이전 경매 물품"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="auction-items-preview" ref={auctionContainerRef}>
          {auctionItems.map((item) => (
            <div
              className="auction-item"
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/auction/detail/${item.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/auction/detail/${item.id}`);
                }
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="auction-item-image"
              />
              <div className="auction-item-details">
                <div className="auction-item-title">{item.title}</div>
                <div className="auction-item-countdown">
                  {formatRemain(item.endIso, nowTs)}
                </div>
                <div className="auction-item-footer">
                  <div className="auction-item-price">{item.price}</div>
                  <div className="auction-item-stats">
                    <span className="auction-item-bids">
                      입찰 {item.bidCount}회
                    </span>
                  </div>
                </div>
              </div>
              <div className="auction-item-meta">
                <svg
                  className={`auction-favorite-icon ${
                    item.isFavorite ? "active" : ""
                  }`}
                  viewBox="0 0 24 24"
                  aria-label="찜하기"
                  role="button"
                  tabIndex="0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }
                  }}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <button
          className="scroll-button scroll-button-right"
          onClick={() => scrollOne(1)}
          disabled={!canScrollRight}
          aria-label="다음 경매 물품"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
}

export default AuctionAdSection;
