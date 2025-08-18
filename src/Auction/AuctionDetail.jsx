// src/Auction/AuctionDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate 추가
import styles from '../AuctionCSS/AuctionDetail.module.css'; // ✅ 새로운 CSS Modules 임포트

function AuctionDetail() {
  const { id } = useParams(); // 경매 상품 ID
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 입찰 관련 상태 (기능 구현을 위해 추가)
  const [currentBid, setCurrentBid] = useState(0);
  const [myBid, setMyBid] = useState(''); // 사용자가 입력할 입찰가

  // ✅ 더미 데이터 사용 (실제로는 API 호출)
  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        // 실제 API 호출: axios.get(`http://localhost:8080/api/auctions/${id}`)
        // 지금은 더미 데이터로 대체
        const dummyAuction = {
          id: id,
          imageUrl: 'https://via.placeholder.com/600x400?text=Auction+Item', // 이미지
          title: `빈티지 시계 #${id}`,
          content:
            `오랜 역사를 간직한 수동 와인딩 시계입니다. 생활 기스 있으며, 작동에 이상 없습니다. 소장가치 높은 아이템입니다. \n\n시작가: 10,000원 \n\n추가 정보: 박스, 보증서 없음`, // 상품 설명
          hit: 1234, // 조회수
          createdAt: '2024-07-25T14:30:00', // 등록일
          productStatus: '사용감 없음',
          startCost: 10000, // 시작가
          currentBid: 15000, // 현재 최고 입찰가
          buyoutCost: 50000, // 즉시 구매가
          auctionEndTime: '2024-08-01T23:59:59', // 경매 종료 시간
          seller: { address: '서울 강남구' },
          category: '시계',
          tag: '#빈티지 #시계 #레트로',
        };
        setAuction(dummyAuction);
        setCurrentBid(dummyAuction.currentBid); // 현재 입찰가를 초기값으로 설정
        setLoading(false);
      } catch (err) {
        console.error('경매 정보 불러오기 실패:', err);
        setError('경매 정보를 불러오지 못했습니다.');
        setLoading(false);
      }
    };
    fetchAuctionDetail();
  }, [id]);

  // 경매 종료까지 남은 시간 계산 함수
  const calculateTimeLeft = () => {
    if (!auction || !auction.auctionEndTime) return '종료 시간 없음';
    const now = new Date();
    const endDate = new Date(auction.auctionEndTime);
    const difference = endDate - now;

    if (difference <= 0) return '경매 종료';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${days}일 ${hours}시 ${minutes}분 ${seconds}초 남음`;
  };

  // 입찰 버튼 핸들러
  const handleBid = () => {
    const bidAmount = parseInt(myBid, 10);
    if (isNaN(bidAmount) || bidAmount <= currentBid) {
      alert(`입찰가는 현재 최고 입찰가(${currentBid.toLocaleString()}원)보다 높아야 합니다.`);
      return;
    }
    // 실제로는 API로 입찰 요청을 보냅니다.
    alert(`${bidAmount.toLocaleString()}원으로 입찰하셨습니다!`);
    setCurrentBid(bidAmount); // 더미 업데이트
    setMyBid(''); // 입력 초기화
  };

  // 즉시 구매 버튼 핸들러
  const handleBuyout = () => {
    if (!auction?.buyoutCost) return;
    if (window.confirm(`${Number(auction.buyoutCost).toLocaleString()}원에 즉시 구매하시겠습니까?`)) {
      alert('즉시 구매가 완료되었습니다!');
      // 실제로는 API로 즉시 구매 요청 후 이동/갱신
      navigate('/'); // 예시
    }
  };

  // 판매자 상점 보기
  const goToSellerShop = () => {
    alert('판매자 상점 페이지로 이동합니다.');
    // navigate(`/shop/${auction.seller.id}`); // 실제 판매자 ID 기반 이동
  };

  // 수정 페이지로 이동(더미에서는 항상 노출)
  const handleEdit = () => {
    navigate(`/edit-auction/${id}`);
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!auction) return <div className={styles.empty}>상품 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.auctionPage}>
      <div className={styles.auctionDetail}>
        <div className={styles.auctionImage}>
          <img
            src={auction.imageUrl}
            alt={auction.title}
            onError={(e) => { e.target.src = '/images/default.jpg'; }} // 이미지 로드 실패 시 대체 이미지
          />
        </div>

        <div className={styles.auctionInfo}>
          <h2 className={styles.auctionTitle}>{auction.title}</h2>

          <div className={styles.auctionTimer}>{calculateTimeLeft()}</div> {/* 남은 시간 */}
          <div className={styles.stats}>
            <span>❤️ 6</span>
            <span>👁 {auction.hit?.toLocaleString?.() ?? auction.hit}</span>
            <span>📅 {auction.createdAt?.slice(0, 10) ?? '-'}</span>
          </div>

          <ul className={styles.details}>
            <li><strong>상품상태:</strong> {auction.productStatus}</li>
            <li><strong>직거래지역:</strong> {auction.seller?.address || '-'}</li>
          </ul>

          {/* 입찰 및 구매 버튼 */}
          <div className={styles.bidSection}>
            <div className={styles.bidInputWrapper}>
              <input
                type="number"
                className={styles.bidInput}
                placeholder="입찰가 입력"
                value={myBid}
                onChange={(e) => setMyBid(e.target.value)}
                min={Number(currentBid) + 1} // 현재가보다 1원이라도 높게
                step={1000}
                inputMode="numeric"
                aria-label="입찰가"
              />
              <span className={styles.currency}>원</span>
            </div>
            <button className={styles.bidButton} type="button" onClick={handleBid}>입찰하기</button>
            {auction.buyoutCost && (
              <button className={styles.buyoutButton} type="button" onClick={handleBuyout}>즉시 구매</button>
            )}
          </div>

          {/* 판매자 상점/수정 버튼 */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={styles.sellerShopButton} type="button" onClick={goToSellerShop}>판매자 상점 보기</button>
            <button className={styles.sellerShopButton} type="button" onClick={handleEdit}>수정</button>
          </div>
        </div>
      </div>

      {/* 하단 추가 정보 섹션 */}
      <div className={styles.auctionExtraInfo}>
        <h3 className={styles.sectionHeading}>상품정보</h3>
        <div className={styles.divider} />
        <p className={styles.auctionDescription}>{auction.content}</p>
        <div className={styles.divider} />
        <div className={styles.extraCards}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>📍 직거래지역</div>
            <div className={styles.cardContent}>{auction.seller?.address || '-'}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>📂 카테고리</div>
            <div className={styles.cardContent}>{auction.category || '-'}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🏷️ 상품태그</div>
            <div className={styles.cardContent}>{auction.tag || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetail;