import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


// ✅ 카테고리 데이터 정의 (실제 앱에서는 API로 받아오거나 별도 파일로 관리)
const categoriesData = {
  '여성의류': {
    '원피스': ['미니원피스', '롱원피스', '쉬폰원피스'],
    '상의': ['블라우스', '티셔츠', '니트'],
    '하의': ['청바지', '스커트', '슬랙스'],
  },
  '남성의류': {
    '셔츠': ['긴팔', '반팔'],
    '바지': ['청바지', '면바지', '반바지'],
    '아우터': ['자켓', '코트', '패딩'],
  },
  '신발': {
    '운동화': ['런닝화', '스니커즈'],
    '구두': ['로퍼', '부츠'],
  },
  '디지털/가전': {
    '휴대폰': ['갤럭시', '아이폰'],
    '노트북': ['맥북', '그램'],
  },
  // 필요한 카테고리를 더 추가하세요.
};


function ProductRegister() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [selectedLargeCategory, setSelectedLargeCategory] = useState(''); // 대분류 선택 상태
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState(''); // 중분류 선택 상태
  const [selectedSmallCategory, setSelectedSmallCategory] = useState(''); // 소분류 선택 상태
  const [productStatus, setProductStatus] = useState('새 상품');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [exchangeable, setExchangeable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('별도');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [tradeLocation, setTradeLocation] = useState('');
  const [tags, setTags] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 12)); // 최대 12장
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveDraft = () => {
    alert('임시 저장되었습니다.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("최종 상품 등록 정보:", {
      productName,
      selectedLargeCategory,
      selectedMiddleCategory,
      selectedSmallCategory,
      productStatus,
      price,
      description,
      images,
    });
    alert('상품이 등록되었습니다.');
  };

  const handleClose = () => {
    navigate(-1);
  };

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

  return (
    <div className="product-register-page">
      <header className="register-header">
        <h1 className="register-title">상품 등록</h1>
        {/* ✅ 닫기 버튼 삭제 */}
        {/* <button className="close-button" onClick={handleClose}>닫기</button> */}
      </header>

      <main className="register-main-content">
        <section className="register-section">
          <h2 className="section-title">상품정보</h2>
          <ul className="form-groups">
            {/* 상품 이미지 */}
            <li className="form-group">
              <div className="form-label">상품이미지<small>({images.length}/12)</small></div>
              <div className="form-content">
                <ul className="image-upload-list">
                  <li className="image-upload-item add-image">
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
                    <li key={index} className="image-upload-item image-preview-item">
                      <img src={imageSrc} alt={`상품 이미지 ${index + 1}`} />
                      <button type="button" className="remove-image-button" onClick={() => handleRemoveImage(index)}>X</button>
                    </li>
                  ))}
                </ul>
                <div className="form-hint">상품 이미지는 PC에서는 1:1, 모바일에서는 1:1.23 비율로 보여져요.</div>
              </div>
            </li>

            {/* 상품명 */}
            <li className="form-group">
              <div className="form-label">상품명</div>
              <div className="form-content">
                <div className="product-name-input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="상품명을 입력해 주세요."
                    maxLength={40}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <a href="https://help.bunjang.co.kr/faq/2/220" target="_blank" rel="noopener noreferrer" className="guide-link">
                    거래금지 품목 보기
                  </a>
                </div>
                <div className="char-counter">{productName.length}/40</div>
              </div>
            </li>

            {/* ✅ 카테고리 섹션 - 번개장터 스타일로 변경 */}
            <li className="form-group">
              <div className="form-label">카테고리</div>
              <div className="form-content category-selection-area">
                {/* 대분류 */}
                <div className="category-column">
                  <ul className="category-list">
                    {Object.keys(categoriesData).map((cat) => (
                      <li key={cat} className={`category-item ${selectedLargeCategory === cat ? 'active' : ''}`}>
                        <button type="button" onClick={() => handleLargeCategoryClick(cat)}>
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 중분류 */}
                <div className="category-column">
                  <ul className="category-list">
                    {selectedLargeCategory ? (
                      Object.keys(categoriesData[selectedLargeCategory]).map((cat) => (
                        <li key={cat} className={`category-item ${selectedMiddleCategory === cat ? 'active' : ''}`}>
                          <button type="button" onClick={() => handleMiddleCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="category-item placeholder">중분류</li>
                    )}
                  </ul>
                </div>

                {/* 소분류 */}
                <div className="category-column">
                  <ul className="category-list">
                    {selectedLargeCategory && selectedMiddleCategory ? (
                      categoriesData[selectedLargeCategory][selectedMiddleCategory].map((cat) => (
                        <li key={cat} className={`category-item ${selectedSmallCategory === cat ? 'active' : ''}`}>
                          <button type="button" onClick={() => handleSmallCategoryClick(cat)}>
                            {cat}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="category-item placeholder">소분류</li>
                    )}
                  </ul>
                </div>
              </div>
            </li>

            {/* 상품 상태 */}
            <li className="form-group">
              <div className="form-label">상품 상태</div>
              <div className="form-content">
                <div className="radio-group">
                  {['새 상품', '사용감 적음', '사용감 많음', '고장/파손'].map((status) => (
                    <label key={status} className="radio-label">
                      <input
                        type="radio"
                        name="productStatus"
                        value={status}
                        checked={productStatus === status}
                        onChange={() => setProductStatus(status)}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </li>

            {/* 가격 */}
            <li className="form-group price-group">
              <div className="form-label">가격</div>
              <div className="form-content">
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    className="form-input price-input"
                    placeholder="가격을 입력해 주세요."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                  />
                  <span className="currency">원</span>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => setNegotiable(e.target.checked)}
                  />
                  가격 제안 받기
                </label>
              </div>
            </li>

            {/* 교환 */}
            <li className="form-group toggle-group">
              <div className="form-label">교환</div>
              <div className="form-content">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={exchangeable}
                    onChange={(e) => setExchangeable(e.target.checked)}
                    className="toggle-checkbox"
                  />
                  <div className="toggle-switch"></div>
                </label>
              </div>
            </li>

            {/* 배송비 */}
            <li className="form-group">
              <div className="form-label">배송비</div>
              <div className="form-content">
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="deliveryFee"
                      value="포함"
                      checked={deliveryFee === '포함'}
                      onChange={() => setDeliveryFee('포함')}
                    />
                    포함
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="deliveryFee"
                      value="별도"
                      checked={deliveryFee === '별도'}
                      onChange={() => setDeliveryFee('별도')}
                    />
                    별도
                  </label>
                </div>
              </div>
            </li>

            {/* 상품 설명 */}
            <li className="form-group">
              <div className="form-label">상품 설명</div>
              <div className="form-content">
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="상품 설명을 입력해주세요. (10자 이상)"
                  rows={8}
                  required
                  minLength="10"
                />
                <div className="char-counter">{description.length}/2000</div>
              </div>
            </li>

            {/* 연락처 */}
            <li className="form-group">
              <div className="form-label">연락처 (선택)</div>
              <div className="form-content">
                <input
                  type="text"
                  className="form-input"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="연락처 (번호, 카톡ID 등)"
                />
              </div>
            </li>

            {/* 거래지역 */}
            <li className="form-group">
              <div className="form-label">거래지역 (선택)</div>
              <div className="form-content">
                <input
                  type="text"
                  className="form-input"
                  value={tradeLocation}
                  onChange={(e) => setTradeLocation(e.target.value)}
                  placeholder="거래지역 입력"
                />
              </div>
            </li>

            {/* 태그 */}
            <li className="form-group">
              <div className="form-label">태그 (선택)</div>
              <div className="form-content">
                <input
                  type="text"
                  className="form-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#태그 #입력 (최대 5개)"
                />
              </div>
            </li>
          </ul>
        </section>
      </main>

      <footer className="register-footer">
        <div className="register-button-group">
          <button type="button" className="btn-draft" onClick={handleSaveDraft}>임시저장</button>
          <button type="submit" className="btn-submit" onClick={handleSubmit}>등록하기</button>
        </div>
      </footer>
    </div>
  );
}

export default ProductRegister;