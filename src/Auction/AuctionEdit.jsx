// src/Auction/AuctionEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams 추가
import stylesLayout from '../AuctionCSS/AuctionEditLayout.module.css'; // ✅ 새 레이아웃 CSS
import stylesForm from '../AuctionCSS/AuctionEditForm.module.css';     // ✅ 새 폼 CSS
import stylesButtons from '../AuctionCSS/AuctionEditButtons.module.css'; // ✅ 새 버튼 CSS

// ✅ 카테고리 데이터 정의 (AuctionRegister.jsx에서 가져오거나 공유)
const categoriesData = {
  '디지털/가전': {
    '휴대폰': ['갤럭시', '아이폰'],
    '노트북': ['맥북', '그램'],
  },
  '의류/잡화': {
    '패션잡화': ['가방', '지갑', '시계'],
    '의류': ['상의', '하의'],
  },
  // 필요한 카테고리를 더 추가하세요.
};


function AuctionEdit() {
  const navigate = useNavigate();
  const { auctionId } = useParams(); // ✅ URL 파라미터에서 경매 ID 가져오기

  // === 경매 상품 정보 상태 초기값 ===
  const [images, setImages] = useState([]);
  const [auctionTitle, setAuctionTitle] = useState(''); // 상품명
  const [auctionContent, setAuctionContent] = useState(''); // 상품 설명
  const [selectedLargeCategory, setSelectedLargeCategory] = useState('');
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState('');
  const [selectedSmallCategory, setSelectedSmallCategory] = useState('');
  const [startCost, setStartCost] = useState(''); // 시작가
  const [buyoutCost, setBuyoutCost] = useState(''); // 즉시 구매가 (선택 사항)
  const [startTime, setStartTime] = useState(''); // 경매 시작 시간
  const [endTime, setEndTime] = '';     // 경매 종료 시간


  // ✅ 상품 데이터 불러오기 (컴포넌트 마운트 시, 수정 모드일 때만)
  useEffect(() => {
    if (auctionId) {
      // 실제 API 호출을 통해 해당 auctionId의 상품 데이터를 불러와 폼을 채웁니다.
      // 지금은 더미 데이터로 대체합니다.
      const fetchAuctionData = async () => {
        // 실제로는 여기에서 fetch('/api/auctions/' + auctionId) 등을 호출합니다.
        const dummyAuction = {
          id: auctionId,
          images: ['https://via.placeholder.com/150?text=Prod1', 'https://via.placeholder.com/150?text=Prod2'],
          auctionTitle: `수정할 경매 상품 ${auctionId}`,
          auctionContent: '이 상품은 경매로 진행되며, 희소성이 높은 상품입니다. 상태 아주 좋습니다.',
          selectedLargeCategory: '디지털/가전',
          selectedMiddleCategory: '휴대폰',
          selectedSmallCategory: '갤럭시',
          startCost: 100000,
          buyoutCost: 200000,
          startTime: '2024-07-27T10:00', // 예시 (ISO 8601 형식)
          endTime: '2024-07-28T10:00',   // 예시
        };

        setImages(dummyAuction.images);
        setAuctionTitle(dummyAuction.auctionTitle);
        setAuctionContent(dummyAuction.auctionContent);
        setSelectedLargeCategory(dummyAuction.selectedLargeCategory);
        setSelectedMiddleCategory(dummyAuction.selectedMiddleCategory);
        setSelectedSmallCategory(dummyAuction.selectedSmallCategory);
        setStartCost(dummyAuction.startCost);
        setBuyoutCost(dummyAuction.buyoutCost);
        setStartTime(dummyAuction.startTime);
        setEndTime(dummyAuction.endTime);
      };

      fetchAuctionData();
    }
  }, [auctionId]); // auctionId가 변경될 때마다 데이터를 다시 불러옵니다.


  // === 기존 이미지 핸들러 ===
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 12)); // 최대 12장
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  // === 기존 카테고리 핸들러 ===
  const handleLargeCategoryClick = (cat) => {
    setSelectedLargeCategory(cat);
    setSelectedMiddleCategory('');
    setSelectedSmallCategory('');
  };

  const handleMiddleCategoryClick = (cat) => {
    setSelectedMiddleCategory(cat);
    setSelectedSmallCategory('');
  };

  const handleSmallCategoryClick = (cat) => {
    setSelectedSmallCategory(cat);
  };


  // === 경매 상품 업데이트 처리 ===
  const handleUpdateAuction = (e) => {
    e.preventDefault();
    // 여기에 경매 상품 업데이트 (PUT/PATCH) 로직 (API 호출 등)을 추가합니다.
    console.log(`경매 상품 ${auctionId} 업데이트 정보:`, {
      images,
      auctionTitle,
      auctionContent,
      category: {
        large: selectedLargeCategory,
        middle: selectedMiddleCategory,
        small: selectedSmallCategory,
      },
      startCost,
      buyoutCost,
      startTime,
      endTime,
    });

    if (!auctionTitle || !auctionContent || !selectedLargeCategory || !startCost || !startTime || !endTime) {
      alert("필수 입력 사항을 모두 채워주세요.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert("경매 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    alert('경매 상품이 성공적으로 수정되었습니다.');
    navigate(-1); // 수정 후 이전 페이지로 이동
  };

  const handleSaveDraft = () => {
    alert('임시 저장되었습니다.');
  };

  return (
    <div className={stylesLayout.auctionRegisterPage}> {/* Layout에서 가져온 기본 페이지 스타일 */}
      <main className={stylesLayout.mainContent}>
        <section className={stylesLayout.section}>
          <h1 className={stylesLayout.pageTitle}>경매 상품 수정</h1>
          <h2 className={stylesLayout.sectionTitle}>경매 상품 정보</h2>
          <ul className={stylesLayout.formGroups}>

            {/* 상품 이미지 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품 이미지<small>({images.length}/12)</small></div>
              <div className={stylesLayout.formContent}>
                <ul className={stylesForm.imageUploadList}>
                  <li className={`${stylesForm.imageUploadItem} ${stylesForm.addImage}`}>
                    <label htmlFor="image-upload-input">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span>이미지 등록</span>
                    </label>
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/jpg, image/jpeg, image/png"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </li>
                  {images.map((imageSrc, index) => (
                    <li key={index} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img src={imageSrc} alt={`상품 이미지 ${index + 1}`} />
                      <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(index)}>X</button>
                    </li>
                  ))}
                </ul>
                <div className={stylesForm.formHint}>경매 상품 이미지는 최대 12장까지 등록 가능합니다.</div>
              </div>
            </li>

            {/* 경매 상품명 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품명</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="text"
                  className={stylesForm.formInput}
                  placeholder="경매 상품명을 입력해 주세요."
                  maxLength={50}
                  value={auctionTitle}
                  onChange={(e) => setAuctionTitle(e.target.value)}
                  required
                />
                <div className={stylesForm.charCounter}>{auctionTitle.length}/50</div>
              </div>
            </li>

            {/* 카테고리 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>카테고리</div>
              <div className={`${stylesLayout.formContent} ${stylesForm.categorySelectionArea}`}>
                {/* 대분류 */}
                <div className={stylesForm.categoryColumn}>
                  <ul className={stylesForm.categoryList}>
                    {Object.keys(categoriesData).map((cat) => (
                      <li key={cat} className={`${stylesForm.categoryItem} ${selectedLargeCategory === cat ? stylesForm.active : ''}`}>
                        <button type="button" onClick={() => handleLargeCategoryClick(cat)}>
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* 중분류 */}
                <div className={stylesForm.categoryColumn}>
                  <ul className={stylesForm.categoryList}>
                    {selectedLargeCategory ? (
                      Object.keys(categoriesData[selectedLargeCategory]).map((cat) => (
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedMiddleCategory === cat ? stylesForm.active : ''}`}>
                          <button type="button" onClick={() => handleMiddleCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류</li>
                    )}
                  </ul>
                </div>
                {/* 소분류 */}
                <div className={stylesForm.categoryColumn}>
                  <ul className={stylesForm.categoryList}>
                    {selectedLargeCategory && selectedMiddleCategory ? (
                      categoriesData[selectedLargeCategory][selectedMiddleCategory].map((cat) => (
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedSmallCategory === cat ? stylesForm.active : ''}`}> {/* active는 선택된 것만 되어야 함 */}
                          <button type="button" onClick={() => handleSmallCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류</li>
                    )}
                  </ul>
                </div>
              </div>
            </li>

            {/* 시작가 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>시작가</div>
              <div className={stylesLayout.formContent}>
                <div className={stylesForm.priceInputWrapper}>
                  <input
                    type="number"
                    className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                    placeholder="경매 시작가를 입력해 주세요."
                    value={startCost}
                    onChange={(e) => setStartCost(e.target.value)}
                    min="1"
                    required
                  />
                  <span className={stylesForm.currency}>원</span>
                </div>
              </div>
            </li>

            {/* 즉시 구매가 (선택 사항) */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>즉시 구매가 (선택)</div>
              <div className={stylesLayout.formContent}>
                <div className={stylesForm.priceInputWrapper}>
                  <input
                    type="number"
                    className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                    placeholder="즉시 구매가를 입력해 주세요."
                    value={buyoutCost}
                    onChange={(e) => setBuyoutCost(e.target.value)}
                    min={startCost ? parseInt(startCost) + 1 : "1"} // 시작가보다 높게 설정
                  />
                  <span className={stylesForm.currency}>원</span>
                </div>
              </div>
            </li>

            {/* 경매 시작 시간 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>경매 시작 시간</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="datetime-local"
                  className={stylesForm.formInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </li>

            {/* 경매 종료 시간 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>경매 종료 시간</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="datetime-local"
                  className={stylesForm.formInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </li>

            {/* 경매 상품 설명 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품 설명</div>
              <div className={stylesLayout.formContent}>
                <textarea
                  className={stylesForm.formTextarea}
                  value={auctionContent}
                  onChange={(e) => setAuctionContent(e.target.value)}
                  placeholder="경매 상품 설명을 입력해주세요. (10자 이상)"
                  rows={8}
                  required
                  minLength="10"
                />
                <div className={stylesForm.charCounter}>{auctionContent.length}/2000</div>
              </div>
            </li>

          </ul>
        </section>
      </main>

      <footer className={stylesButtons.footer}>
        <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft}>임시저장</button>
        {/* 제출 버튼은 업데이트 함수로 연결 */}
        <button type="submit" className={stylesButtons.btnSubmit} onClick={handleUpdateAuction}>경매 수정하기</button>
      </footer>
    </div>
  );
}

export default AuctionEdit;