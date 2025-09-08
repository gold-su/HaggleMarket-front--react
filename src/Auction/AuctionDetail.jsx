// src/Auction/AuctionDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAuctionDetail, placeBid, buyout, BASE } from "../api/auction";
import styles from "../AuctionCSS/AuctionDetail.module.css";
import BidHistoryModal from "../components/BidHistoryModal";

function AuctionDetail() {
  const { id } = useParams(); //URL에서 경매 ID 추출
  const navigate = useNavigate(); //페이지 이동 훅

  const [activeIdx, setActiveIdx] = useState(0);
  const [auction, setAuction] = useState(null); //경매 데이텨 객체
  const [errMsg, setErrorMsg] = useState(""); //에러 메시지
  const [loading, setLoading] = useState(true); //로딩중 여부

  // 입찰 관련 상태 (기능 구현을 위해 추가) currentPrice : 현재 가격. 서버에서 오는 필드명이 달라질 수 있어서 여러 경우 (currentPrice, currentCost, startCost)를 대비.
  const currentPrice =
    auction?.currentPrice ?? auction?.currentCost ?? auction?.startCost ?? 0; // 현재 입찰가 (경매 시작가로 초기화)
  const [myBid, setMyBid] = useState(""); // myBid : 사용자가 입력할 입찰가

  const [openBids, setOpenBids] = useState(false);
  const openBidModal = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      // 로그인 후 돌아오도록 next 파라미터(Optional)
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setOpenBids(true);
  };
  const closeBidModal = () => setOpenBids(false);

  //경로 문자열을 배열로 변환 (예: "여성의류 > 상의 > 티셔츠" → ["여성의류","상의","티셔츠"])
  const categoryParts = useMemo(() => {
    const raw = auction?.categoryPath ?? auction?.category ?? ""; // 백엔드에서 categoryPath 내려오면 우선 사용
    if (!raw || typeof raw !== "string") return [];
    return raw
      .split(">")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [auction?.categoryPath, auction?.category]);

  const categoryIds = auction?.categoryIds;

  // auction.images가 숫자 id 배열일 수도 있고, url 배열일 수도 있음.
  // id면 ${BASE}/api/auction/images/{id} 형태로 변환.
  // url이 있으면 그대로 사용.
  // useMemo: auction 바뀔 때만 계산 → 불필요한 연산 방지.
  // mainImage: 대표 이미지 (첫 번째 이미지).
  //이미지 src들 만들기 (imageId 배열인 경우)
  const imageSrcList = useMemo(
    () => (Array.isArray(auction?.images) ? auction.images : []),
    [auction]
  );
  // 총 이미지 개수
  const total = imageSrcList.length;

  useEffect(() => {
    setActiveIdx(0);
  }, [total]);

  const goPrev = () => setActiveIdx((i) => (i - 1 + total) % total);
  const goNext = () => setActiveIdx((i) => (i + 1) % total);
  // 키보드 네비게이션(좌/우)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  // 간단한 터치 스와이프
  const [touchX, setTouchX] = useState(null);
  const onTouchStart = (e) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) dx > 0 ? goPrev() : goNext();
    setTouchX(null);
  };

  const mainImage = imageSrcList[activeIdx] ?? "/images/default.jpg"; //첫 번째 이미지 또는 기본 이미지
  useEffect(() => {
    console.log(
      "🖼 imageSrcList changed",
      imageSrcList,
      "count=",
      imageSrcList.length
    );
  }, [imageSrcList]);
  //남은 시간 표시용, 남은 시간을 초 단위로 갱신, 종료 시간이 지나면 "경매 종료" 표시
  const [leftText, setLeftText] = useState(""); //남은 시간 표시용 텍스트
  useEffect(() => {
    if (!auction?.endTime) return setLeftText("");
    const tick = () => {
      const left = new Date(auction.endTime).getTime() - Date.now(); //남은 시간 계산
      if (left <= 0) {
        setLeftText("경매 종료");
        return;
      }
      const d = Math.floor(left / 86400000);
      const h = Math.floor((left % 86400000) / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      setLeftText(`${d}일 ${h}시 ${m}분 ${s}초 남음`);
    };
    tick(); //초기값 설정
    const t = setInterval(tick, 1000); // 1초마다 tick 호출
    return () => clearInterval(t);
  }, [auction?.endTime]);

  // 상세 불러오기
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await fetchAuctionDetail(id); //경매 상세 API 호출
        const rawUrls = data.imagesUrls ?? data.imageUrls ?? [];
        const images = Array.isArray(rawUrls)
          ? rawUrls.map((u) => (u.startsWith("http") ? u : `${BASE}${u}`)) // 절대 URL로
          : [];
        console.log("📦 서버 응답 데이터:", data); // ✅ 콘솔 확인용
        console.log("🖼 정규화 전 rawUrls:", rawUrls);
        console.log("🖼️ normalized images:", images);
        //백엔드 DTO를 안전하게 정규화, 상황에 따라 다를 수 있으므로 여러 케이스를 ?? 연산자로 정규화
        const normalized = {
          id: data.id ?? data.auctionId ?? Number(id),
          title: data.title ?? "",
          content: data.content ?? "",
          startCost: data.startCost ?? data.startPrice ?? 0,
          currentPrice:
            data.currentPrice ?? data.currentCost ?? data.highestBid ?? 0,
          buyoutCost:
            data.buyoutCost ?? data.buyoutPrice ?? data.buyNowPrice ?? null,
          endTime: data.endTime ?? data.endsAt ?? null,
          hit: data.hit ?? 0,
          createdAt: data.createdAt ?? data.createdDate ?? "",
          bidCount: data.bidCount ?? data.bids ?? 0,
          // 이미지: 숫자/문자 id 배열 혹은 url 배열 둘 다 허용
          // 서버 키 오타 대응(imagesUrls) + 절대 URL로 보정
          images,
          seller: data.seller ?? { address: data.sellerAddress ?? "-" },
          categoryPath: data.categoryPath ?? data.category ?? "", // "대 > 중 > 소"
          categoryIds: data.categoryIds ?? data.categoryIdPath ?? null, // [largeId, middleId, smallId]가 내려오면 활용
          category: data.category ?? "",
          tag: data.tag ?? "",
        };
        setAuction(normalized); //정규화된 데이터 저장하여 UI에서 바로 사용 가능하도록 함
      } catch (e) {
        if (e?.response?.status === 404) {
          setErrorMsg("존재하지 않는 경매입니다.");
          navigate("/"); // 존재하지 않는 경매라면 자동 이동
        } else {
          setErrorMsg("경매 정보를 불러오는 데 실패했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    load(); //경매 상세 불러오기 함수 호출
  }, [id]); //id가 바뀔 때마다 호출

  // 입찰 버튼 핸들러
  const handleBid = async () => {
    const bidAmount = Number(myBid);
    if (!bidAmount || bidAmount <= currentPrice) {
      alert(
        `입찰가는 현재가(${currentPrice.toLocaleString()}원)보다 높아야 합니다.`
      );
      return;
    }
    try {
      const res = await placeBid(id, bidAmount);
      if (res?.success) {
        alert(res.message ?? "입찰이 완료되었습니다.");
        setAuction((prev) =>
          prev
            ? {
                ...prev,
                currentPrice: res.currentHighestBid ?? bidAmount,
                bidCount: (prev.bidCount ?? 0) + 1,
              }
            : prev
        );
        setMyBid("");
      } else {
        alert(res?.message ?? "입찰에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("입찰 요청 중 오류가 발생했습니다.");
    }
  };
  const isEnded = leftText === "경매 종료";
  // 값 정규화
  const rawBuyout = auction?.buyoutCost ?? auction?.buyoutPrice ?? null; // 둘 중 들어오는 걸 사용
  const buyoutCost = rawBuyout == null ? null : Number(rawBuyout);

  // 0 또는 음수는 '불가'로 간주
  const hasBuyout = buyoutCost != null && buyoutCost > 0;

  // 텍스트: 항상 노출
  const buyoutText = hasBuyout
    ? `${buyoutCost.toLocaleString()}원`
    : "즉시구매 불가";

  // 버튼 활성 조건(정책에 맞게 조정)
  // - 즉시구매가 존재
  // - 현재가 이상(백엔드 검증도 있지만 프론트도 방어)
  // - 종료 아님
  // - (선택) 진행중일 때만 허용하려면 status 체크도 추가
  const status = auction?.status; // READY/ONGOING/ENDED 내려오면 사용
  const canBuyNow = hasBuyout && buyoutCost >= currentPrice && !isEnded; // && status === 'ONGOING'  // 필요시 활성 조건 강화

  // 비활성 사유 툴팁(옵션)
  const disabledReason = !hasBuyout
    ? "즉시구매가 미설정"
    : isEnded
    ? "경매가 종료되어 즉시구매 불가"
    : buyoutCost < currentPrice
    ? "즉시구매가가 현재가보다 낮아 불가"
    : undefined;

  function handleBuyoutClick() {
    if (!canBuyNow) return; // 방어코드
    handleBuyout(); // 기존 로직 호출
  }

  // 즉시 구매 버튼 핸들러
  const handleBuyout = async () => {
    const price = auction?.buyoutCost ?? auction?.buyoutPrice;
    if (price == null) return;
    if (
      !window.confirm(
        `${Number(price).toLocaleString()}원에 즉시 구매하시겠습니까?`
      )
    )
      return;
    try {
      const res = await buyout(id); // 먼저 호출/대기
      if (res?.success) {
        alert(res?.message ?? "즉시 구매가 완료되었습니다!");
        navigate("/"); // 성공 후 이동
      } else {
        alert(res?.message ?? "즉시 구매에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("즉시 구매 요청 중 오류가 발생했습니다.");
    }
  };

  // 판매자 상점 보기
  const goToSellerShop = () => {
    alert("판매자 상점 페이지로 이동합니다.");
    // navigate(`/shop/${auction.seller.id}`); // 실제 판매자 ID 기반 이동
  };

  //카테고리 빵부스러기 클릭(가능할 때만)
  const onCrumbClick = (idx) => {
    if (!categoryIds || !Array.isArray(categoryIds) || !categoryIds[idx])
      return;
    const targetId = categoryIds[idx]; // large/middle/small 중 idx번째 ID
    navigate(`/categories/${targetId}/posts`);
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (errMsg) return <div className={styles.error}>{errMsg}</div>;
  if (!auction)
    return <div className={styles.empty}>상품 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.auctionPage}>
      <div className={styles.auctionDetail}>
        <div className={styles.auctionImage}>
          <div
            className={styles.mainWrapper}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={mainImage}
              alt={`${auction.title} - ${activeIdx + 1}/${total}`}
              onError={(e) => {
                e.currentTarget.src = "/images/default.jpg";
              }}
              className={styles.mainImg}
              loading="eager"
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.left}`}
                  onClick={goPrev}
                  aria-label="이전 이미지"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.navBtn} ${styles.right}`}
                  onClick={goNext}
                  aria-label="다음 이미지"
                >
                  ›
                </button>
                <div className={styles.counter}>
                  {activeIdx + 1} / {total}
                </div>
              </>
            )}
          </div>

          {imageSrcList.length > 1 && (
            <div className={styles.thumbRow}>
              {imageSrcList.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.thumbBtn} ${
                    idx === activeIdx ? styles.active : ""
                  }`}
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`${idx + 1}번 이미지 보기`}
                  title={`${idx + 1}번 이미지`}
                >
                  <img
                    src={src}
                    alt={`thumbnail-${idx + 1}`}
                    className={styles.thumb}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.auctionInfo}>
          <h2 className={styles.auctionTitle}>{auction.title}</h2>
          <div className={styles.auctionPrices}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>시작가:</span>
              <span className={styles.priceValue}>
                {(auction.startCost ?? 0).toLocaleString()}원
              </span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>현재 최고 입찰가:</span>
              <span className={`${styles.priceValue} ${styles.currentBid}`}>
                {currentPrice.toLocaleString()}원
              </span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>즉시 구매가:</span>
              <span
                className={
                  !hasBuyout ? styles.priceValueUnavailable : styles.priceValue
                }
              >
                {buyoutText}
              </span>
            </div>
          </div>

          <div className={styles.auctionTimer}>
            {leftText || "종료 시간 정보 없음"}
          </div>
          <div className={styles.stats}>
            <span
              className={styles.statsLink}
              role="button"
              tabIndex={0}
              onClick={openBidModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openBidModal();
                }
              }}
              aria-label="입찰 내역 보기"
              title="입찰 내역 보기"
            >
              🔨입찰 {auction.bidCount ?? 0}
            </span>
            <span>👁 {auction.hit ?? 0}</span>
            <span>📅 {(auction.createdAt ?? "").slice(0, 10)}</span>
            {/* 입찰 내역 모달 */}
            <BidHistoryModal
              open={openBids}
              onClose={closeBidModal}
              auctionId={Number(id)}
            />
          </div>

          <ul className={styles.details}>
            <li>
              <strong>직거래지역:</strong> {auction.seller?.address ?? "-"}
            </li>
            <li>
              <strong>카테고리:</strong>{" "}
              {categoryParts.length ? categoryParts.join(" > ") : "-"}
            </li>
            <li>
              <strong>태그:</strong> {auction.tag || "-"}
            </li>
          </ul>

          <div className={styles.bidSection}>
            <div className={styles.bidInputWrapper}>
              <input
                type="number"
                className={styles.bidInput}
                placeholder="입찰가 입력"
                value={myBid}
                onChange={(e) => setMyBid(e.target.value)}
                min={currentPrice + 1}
              />
              <span className={styles.currency}>원</span>
            </div>
            <button
              className={styles.bidButton}
              onClick={handleBid}
              disabled={
                isEnded ||
                !Number.isFinite(Number(myBid)) ||
                Number(myBid) <= currentPrice
              }
            >
              {" "}
              입찰하기
            </button>
            <button
              className={styles.buyoutButton}
              onClick={handleBuyoutClick}
              disabled={!canBuyNow}
              title={!canBuyNow ? disabledReason : undefined}
            >
              즉시 구매
            </button>
          </div>

          <button className={styles.sellerShopButton} onClick={goToSellerShop}>
            판매자 상점 보기
          </button>
        </div>
      </div>

      <div className={styles.auctionExtraInfo}>
        <h3 className={styles.sectionHeading}>상품정보</h3>
        <div className={styles.divider} />
        <p className={styles.auctionDescription}>{auction.content || "-"}</p>
      </div>
    </div>
  );
}

export default AuctionDetail;
