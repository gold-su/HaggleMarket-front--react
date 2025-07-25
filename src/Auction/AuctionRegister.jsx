// src/Auction/AuctionRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ CSS Modules 임포트 방식 변경
import stylesLayout from '../AuctionCSS/AuctionRegisterLayout.module.css'; // 레이아웃 스타일
import stylesForm from '../AuctionCSS/AuctionRegisterForm.module.css';   // 폼 요소 스타일
import stylesButtons from '../AuctionCSS/AuctionRegisterButtons.module.css'; // 버튼 스타일

// ✅ 카테고리 데이터 정의 (ProductRegister.jsx와 동일)
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

function AuctionRegister() {
  const navigate = useNavigate();

  // ✅ 이미지 관련 상태
  const [images, setImages] = useState([]);

  // ✅ 상품 기본 정보 상태
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionContent, setAuctionContent] = useState(''); // 상품 설명
  const [selectedLargeCategory, setSelectedLargeCategory] = useState('');
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState('');
  const [selectedSmallCategory, setSelectedSmallCategory] = useState('');

  // ✅ 경매 전용 정보 상태
  const [startCost, setStartCost] = useState(''); // 시작가
  const [buyoutCost, setBuyoutCost] = useState(''); // 즉시 구매가 (선택 사항)
  const [startTime, setStartTime] = useState(''); // 경매 시작 시간 (datetime-local 형식)
  const [endTime, setEndTime] = useState('');     // 경매 종료 시간 (datetime-local 형식)

  // ✅ 이미지 핸들러 (ProductRegister.jsx와 동일)
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 12)); // 최대 12장
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // ✅ 카테고리 핸들러 (ProductRegister.jsx와 동일)
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

  // ✅ 경매 상품 등록 처리
  const handleSubmitAuction = (e) => {
    e.preventDefault();
    // 여기에 경매 상품 등록 로직 (API 호출 등)을 추가합니다.
    console.log("경매 상품 등록 정보:", {
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

    alert('경매 상품이 등록되었습니다.');
    navigate(-1); // 등록 후 이전 페이지로 이동
  };

  const handleSaveDraft = () => {
    alert('임시 저장되었습니다.');
  };

  return (
    // ✅ stylesLayout 사용
    <div className={stylesLayout.auctionRegisterPage}>
      {/* ✅ stylesLayout 사용 */}
      <main className={stylesLayout.mainContent}>
        {/* ✅ stylesLayout 사용 */}
        <section className={stylesLayout.section}>
          {/* ✅ stylesLayout 사용 */}
          <h1 className={stylesLayout.pageTitle}>경매 상품 등록</h1>
          {/* ✅ stylesLayout 사용 */}
          <h2 className={stylesLayout.sectionTitle}>경매 상품 정보 입력</h2>
          {/* ✅ stylesLayout 사용 */}
          <ul className={stylesLayout.formGroups}>

            {/* 상품 이미지 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품 이미지<small>({images.length}/12)</small></div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <ul className={stylesForm.imageUploadList}>
                  {/* ✅ stylesForm 사용 */}
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
                    // ✅ stylesForm 사용
                    <li key={index} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img src={imageSrc} alt={`상품 이미지 ${index + 1}`} />
                      {/* ✅ stylesForm 사용 */}
                      <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(index)}>X</button>
                    </li>
                  ))}
                </ul>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.formHint}>경매 상품 이미지는 최대 12장까지 등록 가능합니다.</div>
              </div>
            </li>

            {/* 경매 상품명 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품명</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <input
                  type="text"
                  className={stylesForm.formInput}
                  placeholder="경매 상품명을 입력해 주세요."
                  maxLength={50}
                  value={auctionTitle}
                  onChange={(e) => setAuctionTitle(e.target.value)}
                  required
                />
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.charCounter}>{auctionTitle.length}/50</div>
              </div>
            </li>

            {/* 카테고리 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>카테고리</div>
              {/* ✅ stylesLayout 및 stylesForm 사용 */}
              <div className={`${stylesLayout.formContent} ${stylesForm.categorySelectionArea}`}>
                {/* 대분류 */}
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.categoryColumn}>
                  {/* ✅ stylesForm 사용 */}
                  <ul className={stylesForm.categoryList}>
                    {Object.keys(categoriesData).map((cat) => (
                      // ✅ stylesForm 사용
                      <li key={cat} className={`${stylesForm.categoryItem} ${selectedLargeCategory === cat ? stylesForm.active : ''}`}>
                        {/* ✅ stylesForm 사용 */}
                        <button type="button" onClick={() => handleLargeCategoryClick(cat)}>
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* 중분류 */}
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.categoryColumn}>
                  {/* ✅ stylesForm 사용 */}
                  <ul className={stylesForm.categoryList}>
                    {selectedLargeCategory ? (
                      Object.keys(categoriesData[selectedLargeCategory]).map((cat) => (
                        // ✅ stylesForm 사용
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedMiddleCategory === cat ? stylesForm.active : ''}`}>
                          {/* ✅ stylesForm 사용 */}
                          <button type="button" onClick={() => handleMiddleCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      // ✅ stylesForm 사용
                      <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류</li>
                    )}
                  </ul>
                </div>
                {/* 소분류 */}
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.categoryColumn}>
                  {/* ✅ stylesForm 사용 */}
                  <ul className={stylesForm.categoryList}>
                    {selectedLargeCategory && selectedMiddleCategory ? (
                      categoriesData[selectedLargeCategory][selectedMiddleCategory].map((cat) => (
                        // ✅ stylesForm 사용
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedSmallCategory === cat ? stylesForm.active : ''}`}> {/* active는 선택된 것만 되어야 함 */}
                          {/* ✅ stylesForm 사용 */}
                          <button type="button" onClick={() => handleSmallCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      // ✅ stylesForm 사용
                      <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류</li>
                    )}
                  </ul>
                </div>
              </div>
            </li>

            {/* 시작가 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>시작가</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.priceInputWrapper}>
                  {/* ✅ stylesForm 사용 */}
                  <input
                    type="number"
                    className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                    placeholder="경매 시작가를 입력해 주세요."
                    value={startCost}
                    onChange={(e) => setStartCost(e.target.value)}
                    min="1"
                    required
                  />
                  {/* ✅ stylesForm 사용 */}
                  <span className={stylesForm.currency}>원</span>
                </div>
              </div>
            </li>

            {/* 즉시 구매가 (선택 사항) */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>즉시 구매가 (선택)</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.priceInputWrapper}>
                  {/* ✅ stylesForm 사용 */}
                  <input
                    type="number"
                    className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                    placeholder="즉시 구매가를 입력해 주세요."
                    value={buyoutCost}
                    onChange={(e) => setBuyoutCost(e.target.value)}
                    min={startCost ? parseInt(startCost) + 1 : "1"} // 시작가보다 높게 설정
                  />
                  {/* ✅ stylesForm 사용 */}
                  <span className={stylesForm.currency}>원</span>
                </div>
              </div>
            </li>

            {/* 경매 시작 시간 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>경매 시작 시간</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
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
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>경매 종료 시간</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
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
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품 설명</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <textarea
                  className={stylesForm.formTextarea}
                  value={auctionContent}
                  onChange={(e) => setAuctionContent(e.target.value)}
                  placeholder="경매 상품 설명을 입력해주세요. (10자 이상)"
                  rows={8}
                  required
                  minLength="10"
                />
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.charCounter}>{auctionContent.length}/2000</div>
              </div>
            </li>

          </ul>
        </section>
      </main>

      {/* ✅ stylesButtons 사용 */}
      <footer className={stylesButtons.footer}>
        {/* ✅ stylesButtons 사용 */}
        <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft}>임시저장</button>
        {/* ✅ stylesButtons 사용 */}
        <button type="submit" className={stylesButtons.btnSubmit} onClick={handleSubmitAuction}>경매 등록하기</button>
      </footer>
    </div>
  );
}

export default AuctionRegister;