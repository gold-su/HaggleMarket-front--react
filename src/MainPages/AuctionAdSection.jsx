// src/components/AuctionAdSection.js
import React, { useState, useRef, useEffect } from 'react';
import '../MainPagesCSS/auctionadsection.css'; // CSS 파일 경로를 맞춰주세요


function AuctionAdSection() {
  const auctionContainerRef = useRef(null); // 스크롤 컨테이너 참조
  const [canScrollLeft, setCanScrollLeft] = useState(false); // 스크롤 버튼 상태
  const [canScrollRight, setCanScrollRight] = useState(false); // 스크롤 버튼 상태

  // 경매 물품 더미 데이터 (실제로는 API에서 받아옴)
  const [auctionItems, setAuctionItems] = useState([
    {
      id: 1,
      title: '빈티지 시계',
      description: '희귀한 수동 와인딩 시계',
      price: '150,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Watch', // 이미지 크기 조정
      daysAgo: '1일 전',
      isFavorite: false,
    },
    {
      id: 2,
      title: '한정판 피규어',
      description: '미개봉 소장용 피규어',
      price: '80,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Figure', // 이미지 크기 조정
      daysAgo: '3일 전',
      isFavorite: true,
    },
    {
      id: 3,
      title: '수제 가죽 지갑',
      description: '장인의 손길로 만든 지갑',
      price: '65,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Wallet', // 이미지 크기 조정
      daysAgo: '5일 전',
      isFavorite: false,
    },
    { // 추가 아이템 (스크롤 테스트용)
      id: 4,
      title: '클래식 카메라',
      description: '작동 양호한 필름 카메라',
      price: '220,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Camera', // 이미지 크기 조정
      daysAgo: '7일 전',
      isFavorite: false,
    },
    {
      id: 5,
      title: '디자이너 의자',
      description: '모던 디자인의 편안한 의자',
      price: '300,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Chair', // 이미지 크기 조정
      daysAgo: '10일 전',
      isFavorite: true,
    },
    {
      id: 6,
      title: '고급 만년필',
      description: '필기감 좋은 명품 만년필',
      price: '100,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Pen', // 이미지 크기 조정
      daysAgo: '12일 전',
      isFavorite: false,
    },
    {
      id: 7,
      title: '레트로 게임기',
      description: '추억의 게임을 즐겨보세요',
      price: '90,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Game', // 이미지 크기 조정
      daysAgo: '15일 전',
      isFavorite: false,
    },
    {
      id: 8,
      title: '미니 빔 프로젝터',
      description: '어디서든 나만의 영화관',
      price: '180,000원',
      imageUrl: 'https://via.placeholder.com/280x180?text=Projector', // 이미지 크기 조정
      daysAgo: '18일 전',
      isFavorite: true,
    },
  ]);

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
    if (auctionContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = auctionContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  // 스크롤 버튼 클릭 핸들러
  const scrollItems = (direction) => {
    if (auctionContainerRef.current) {
      const itemWidth = 280; // auction-item의 고정 너비 (CSS와 일치)
      const gapWidth = 20; // auction-items-preview의 gap (CSS와 일치)
      const itemsToShow = 3; // 한 번에 보여줄 아이템 개수
      const scrollAmount = (itemWidth * itemsToShow) + (gapWidth * (itemsToShow - 1)); // 3개 아이템 너비 + 2개 간격

      auctionContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // 컴포넌트 마운트 시 및 스크롤 시 버튼 상태 업데이트
  useEffect(() => {
    updateScrollButtons(); // 초기 로드 시 버튼 상태 업데이트
    const currentRef = auctionContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', updateScrollButtons); // 스크롤 이벤트 리스너
      window.addEventListener('resize', updateScrollButtons); // 화면 크기 변경 시 리스너
    }
    return () => { // 컴포넌트 언마운트 시 이벤트 리스너 제거
      if (currentRef) {
        currentRef.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      }
    };
  }, [auctionItems]); // auctionItems가 변경될 때도 업데이트 (데이터 로드 시)

  return (
    <section className="auction-ad-section">
      <h2>현재 베스트 경매 목록</h2> {/* 제목만 남김 */}
      <div className="auction-items-wrapper"> {/* 스크롤 버튼과 아이템 컨테이너를 감싸는 래퍼 */}
        <button
          className="scroll-button scroll-button-left"
          onClick={() => scrollItems('left')}
          disabled={!canScrollLeft}
          aria-label="이전 경매 물품"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="auction-items-preview" ref={auctionContainerRef}> {/* ref 연결 */}
          {auctionItems.map(item => ( // slice(0,3) 제거하여 모든 아이템 렌더링
            <div className="auction-item" key={item.id}>
              <img src={item.imageUrl} alt={item.title} className="auction-item-image" />
              <div className="auction-item-details">
                <div className="auction-item-title">{item.title}</div>
                <div className="auction-item-description">{item.description}</div>
                <div className="auction-item-price">{item.price}</div>
              </div>
              <div className="auction-item-meta">
                <span className="auction-item-days-ago">{item.daysAgo}</span>
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
          onClick={() => scrollItems('right')}
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
