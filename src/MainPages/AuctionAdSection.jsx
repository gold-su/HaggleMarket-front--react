// src/components/AuctionAdSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../MainPagesCSS/auctionadsection.css'; // CSS 파일 경로를 맞춰주세요
import { fetchHotAuctions, BASE } from '../api/auction';
import { useNavigate } from 'react-router-dom';

function AuctionAdSection() {
  const auctionContainerRef = useRef(null); // 스크롤 컨테이너 참조
  const [canScrollLeft, setCanScrollLeft] = useState(false); // 스크롤 버튼 상태
  const [canScrollRight, setCanScrollRight] = useState(false); // 스크롤 버튼 상태
  const navigate = useNavigate();
  // 경매 물품 데이터 
  const [auctionItems, setAuctionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //간단한 포멧터 (컴포넌트 내부에 두면 파일 추가 안 해도 됨)
  const money = (n) => Number(n ?? 0).toLocaleString('ko-KR');
  const absUrl = (url) => (!url ? 'https://via.placeholder.com/280x180?text=No+Image'
    : url.startsWith('http') ? url : `${BASE}${url}`);
  const timeLeft = (iso) => {
    if (!iso) return '';
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return '종료';
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}분 남음`;
    const h = Math.floor(m / 60), rm = m % 60;
    if (h < 24) return `${h}시간 ${rm}분 남음`;
    const d = Math.floor(h / 24);
    return `${d}일 남음`;
  };


  // 찜 아이콘 클릭 핸들러
  const toggleFavorite = (id) => {
    setAuctionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // 스크롤 가능 여부 업데이트 함수
  const updateScrollButtons = () => {
    const root = auctionContainerRef.current;
    if (!root) return;
    const { scrollLeft, scrollWidth, clientWidth } = root;
    const eps = 2; // 오차 보정
    setCanScrollLeft(scrollLeft > eps);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - eps);
  };



  //스크롤 버튼 클릭 핸들러(한 칸 이동)
  const scrollOne = (dir = 1) => {
    const root = auctionContainerRef.current;
    if (!root) return;

    // 카드 하나와 gap의 실제 픽셀 너비 측정
    const firstCard = root.querySelector('.auction-item');
    const styles = window.getComputedStyle(root);
    const gap = parseInt(styles.columnGap || styles.gap || '20', 10);
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;

    const delta = dir * (cardWidth + gap);
    root.scrollBy({ left: delta, behavior: 'smooth' });
  }




  //중앙 정렬 함수 추가
  const centerCard = (index = 0) => {
    const root = auctionContainerRef.current;
    if (!root) return;
    const card = root.querySelectorAll('.auction-item')[index];
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const delta = (cardRect.left - rootRect.left) - (root.clientWidth - card.clientWidth) / 2;
    // 현재 스크롤 기준 보정
    root.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // 🔌 데이터 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const page = await fetchHotAuctions({ page: 0, size: 12 });
        if (cancelled) return;
        const mapped = page.content.map(it => ({
          id: it.auctionId,
          title: it.title,
          description: '', // DTO에 설명 없으면 빈 값
          price: `${money(it.currentPrice)}원`,
          imageUrl: absUrl(it.thumbnailUrl),
          daysAgo: timeLeft(it.endTime), // 라벨 영역 재활용
          isFavorite: false,
          bidCount: Number(it.bidCount ?? 0),
        }));
        setAuctionItems(mapped);
        // 레이아웃 반영 뒤 버튼 상태 갱신
        requestAnimationFrame(updateScrollButtons);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);


  // 컴포넌트 마운트 시 및 스크롤 시 버튼 상태 업데이트
  useEffect(() => {
    updateScrollButtons();
    const root = auctionContainerRef.current;
    if (!root) return;

    root.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      root.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [auctionItems.length]); // auctionItems가 변경될 때도 업데이트 (데이터 로드 시)

  return (
    <section className="auction-ad-section">
      <h2>현재 베스트 경매 목록</h2> {/* 제목만 남김 */}

      {/* 로딩/에러 간단 표시 (옵션) */}
      {loading && <div style={{ color: '#666' }}>불러오는 중…</div>}
      {error && <div style={{ color: '#ef4444' }}>목록을 불러오지 못했습니다.</div>}

      <div className="auction-items-wrapper"> {/* 스크롤 버튼과 아이템 컨테이너를 감싸는 래퍼 */}
        <button
          className="scroll-button scroll-button-left"
          onClick={() => scrollOne(-1)}
          disabled={!canScrollLeft}
          aria-label="이전 경매 물품"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="auction-items-preview" ref={auctionContainerRef}> {/* ref 연결 */}
          {auctionItems.map(item => ( // slice(0,3) 제거하여 모든 아이템 렌더링
            <div
              className="auction-item"
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/auction/detail/${item.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/auction/detail/${item.id}`);
                }
              }}
            >
              <img src={item.imageUrl} alt={item.title} className="auction-item-image" />
              <div className="auction-item-details">
                <div className="auction-item-title">{item.title}</div>
                <div className="auction-item-description">{item.description}</div>
                <div className="auction-item-price">{item.price}</div>
              </div>
              <div className="auction-item-meta">
                <span className="auction-item-days-ago">{item.daysAgo}</span>
                <span className="auction-item-bids">입찰 {item.bidCount}회</span>
                <svg
                  className={`auction-favorite-icon ${item.isFavorite ? 'active' : ''}`}
                  viewBox="0 0 24 24"
                  aria-label="찜하기"
                  role="button"
                  tabIndex="0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      {/* "경매 참여하기" 버튼 제거 */}
      {/* <button className="auction-cta-button">경매 참여하기</button> */}
    </section>
  );
}

export default AuctionAdSection;
