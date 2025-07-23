import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ CSS Modules 임포트 방식 변경
import stylesLayout from '../ProductCSS/ProductRegisterLayout.module.css';
import stylesForm from '../ProductCSS/ProductRegisterForm.module.css';
import stylesButtons from '../ProductCSS/ProductRegisterButtons.module.css';

// ✅ 카테고리 데이터 정의 (실제 앱에서는 API로 받아오거나 별도 파일로 관리)
const categoriesData = {
  '여성의류': {
    '원피스': ['미니원피스', '롱원피스', '셔츠원피스'],
    '상의': ['블라우스', '반팔티', '긴팔티', '니트'],
    '하의': ['청바지', '슬랙스', '치마', '트레이닝'],
    '아우터': ['가디건', '자켓', '코트', '패딩']
  },
  '남성의류': {
    '상의': ['반팔티', '긴팔티', '셔츠', '맨투맨'],
    '하의': ['청바지', '슬랙스', '트레이닝'],
    '아우터': ['자켓', '코트', '패딩', '후드집업']
  },
  '신발': {
    '운동화': ['나이키', '아디다스', '뉴발란스'],
    '구두/로퍼': ['구두', '로퍼'],
    '샌들/슬리퍼': ['슬리퍼', '샌들']
  },
  '가방/지갑': {
    '여성가방': ['토트백', '크로스백', '백팩'],
    '남성가방': ['크로스백', '서류가방', '백팩'],
    '지갑': ['장지갑', '반지갑', '카드지갑']
  },
  '디지털/가전': {
    '휴대폰': ['아이폰', '갤럭시', '기타 안드로이드'],
    '태블릿': ['아이패드', '갤럭시탭'],
    '노트북': ['맥북', '그램', '기타'],
    '카메라': ['DSLR', '미러리스', '즉석카메라']
  },
  '생활/주방': {
    '가구': ['책상', '의자', '수납장'],
    '주방용품': ['냄비', '프라이팬', '식기류'],
    '생활가전': ['청소기', '공기청정기', '선풍기']
  },
  '취미/게임/음반': {
    '게임기': ['닌텐도', '플스', 'XBOX'],
    '음반': ['CD', 'LP', '굿즈'],
    '취미용품': ['피규어', '프라모델', '보드게임']
  },
  '스포츠/레저': {
    '운동기구': ['덤벨', '요가매트', '러닝머신'],
    '야외용품': ['캠핑용품', '텐트', '의자'],
    '자전거': ['로드바이크', 'MTB', '전기자전거']
  },
  '유아/아동': {
    '의류': ['신생아복', '유아복', '아동복'],
    '장난감': ['블럭', '퍼즐', '전자완구'],
    '기저귀/용품': ['기저귀', '아기띠', '젖병']
  },
  '도서/문구': {
    '도서': ['소설', '학습서', '만화책'],
    '문구': ['펜', '노트', '필통'],
    '전자책/리더기': ['전자책 리더기', 'e북']
  }
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
    // ✅ stylesLayout 사용
    <div className={stylesLayout.productRegisterPage}>
      {/* ✅ stylesLayout 사용 */}
      <main className={stylesLayout.registerMainContent}>
        {/* ✅ stylesLayout 사용 */}
        <section className={stylesLayout.registerSection}>
          {/* ✅ stylesLayout 사용 */}
          <h1 className={stylesLayout.registerTitle}>상품 등록</h1>
          {/* ✅ stylesLayout 사용 */}
          <h2 className={stylesLayout.sectionTitle}>상품정보</h2>
          {/* ✅ stylesLayout 사용 */}
          <ul className={stylesLayout.formGroups}>
            {/* 상품 이미지 */}
            {/* ✅ stylesLayout 및 stylesForm 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품이미지<small>({images.length}/12)</small></div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <ul className={stylesForm.imageUploadList}>
                  {/* ✅ stylesForm 사용 (복수 클래스) */}
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
                    // ✅ stylesForm 사용 (복수 클래스)
                    <li key={index} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img src={imageSrc} alt={`상품 이미지 ${index + 1}`} />
                      {/* ✅ stylesForm 사용 */}
                      <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(index)}>X</button>
                    </li>
                  ))}
                </ul>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.formHint}>상품 이미지는 PC에서는 1:1, 모바일에서는 1:1.23 비율로 보여져요.</div>
              </div>
            </li>

            {/* 상품명 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품명</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.productNameInputWrapper}>
                  {/* ✅ stylesForm 사용 */}
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="상품명을 입력해 주세요."
                    maxLength={40}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.charCounter}>{productName.length}/40</div>
              </div>
            </li>

            {/* ✅ 카테고리 섹션 - 번개장터 스타일로 변경 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>카테고리 </div>
              {/* ✅ stylesLayout 및 stylesForm 사용 */}
              <div className={`${stylesLayout.formContent} ${stylesForm.categorySelectionArea}`}>
                {/* 대분류 */}
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.categoryColumn}>
                  {/* ✅ stylesForm 사용 */}
                  <ul className={stylesForm.categoryList}>
                    {Object.keys(categoriesData).map((cat) => (
                      // ✅ stylesForm 사용 (조건부 클래스)
                      <li key={cat} className={`${stylesForm.categoryItem} ${selectedLargeCategory === cat ? stylesForm.active : ''}`}>
                        {/* ✅ stylesForm 사용 */}
                        <button type="button" className={stylesForm.categoryButton} onClick={() => handleLargeCategoryClick(cat)}>
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
                        // ✅ stylesForm 사용 (조건부 클래스)
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedMiddleCategory === cat ? stylesForm.active : ''}`}>
                          {/* ✅ stylesForm 사용 */}
                          <button type="button" className={stylesForm.categoryButton} onClick={() => handleMiddleCategoryClick(cat)}>
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
                        // ✅ stylesForm 사용 (조건부 클래스)
                        <li key={cat} className={`${stylesForm.categoryItem} ${selectedSmallCategory === cat ? stylesForm.active : ''}`}>
                          {/* ✅ stylesForm 사용 */}
                          <button type="button" className={stylesForm.categoryButton} onClick={() => handleSmallCategoryClick(cat)}>
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

            {/* 상품 상태 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품 상태</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.radioGroup}>
                  {/* '새 상품 (미사용)' 등 변경된 텍스트 반영 */}
                  {['새 상품 (미사용)', '사용감 없음', '사용감 적음', '사용감 많음', '고장/파손 상품'].map((status) => (
                    // ✅ stylesForm 사용
                    <label key={status} className={stylesForm.radioLabel}>
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
            {/* ✅ stylesLayout 사용 */}
            <li className={`${stylesLayout.formGroup} ${stylesForm.priceGroup}`}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>가격</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.priceInputWrapper}>
                  {/* ✅ stylesForm 사용 */}
                  <input
                    type="number"
                    className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                    placeholder="가격을 입력해 주세요."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                  />
                  {/* ✅ stylesForm 사용 */}
                  <span className={stylesForm.currency}>원</span>
                </div>
                {/* ✅ stylesForm 사용 */}
                <label className={stylesForm.checkboxLabel}>
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
            {/* ✅ stylesLayout 및 stylesForm 사용 */}
            <li className={`${stylesLayout.formGroup} ${stylesForm.toggleGroup}`}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>교환</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <label className={stylesForm.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={exchangeable}
                    onChange={(e) => setExchangeable(e.target.checked)}
                    className={stylesForm.toggleCheckbox}
                  />
                  <div className={stylesForm.toggleSwitch}></div>
                </label>
              </div>
            </li>

            {/* 배송비 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>배송비</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.radioGroup}>
                  {['포함', '별도'].map((fee) => (
                    // ✅ stylesForm 사용
                    <label key={fee} className={stylesForm.radioLabel}>
                      <input
                        type="radio"
                        name="deliveryFee"
                        value={fee}
                        checked={deliveryFee === fee}
                        onChange={() => setDeliveryFee(fee)}
                      />
                      {fee}
                    </label>
                  ))}
                </div>
              </div>
            </li>

            {/* 상품 설명 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>상품 설명</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <textarea
                  className={stylesForm.formTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="상품 설명을 입력해주세요. (10자 이상)"
                  rows={8}
                  required
                  minLength="10"
                />
                {/* ✅ stylesForm 사용 */}
                <div className={stylesForm.charCounter}>{description.length}/2000</div>
              </div>
            </li>

            {/* 연락처 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>연락처 (선택)</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <input
                  type="text"
                  className={stylesForm.formInput}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="연락처 (번호, 카톡ID 등)"
                />
              </div>
            </li>

            {/* 거래지역 */}
            {/* ✅ stylesLayout 사용 */}
            <li className={stylesLayout.formGroup}>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formLabel}>거래지역 (선택)</div>
              {/* ✅ stylesLayout 사용 */}
              <div className={stylesLayout.formContent}>
                {/* ✅ stylesForm 사용 */}
                <input
                  type="text"
                  className={stylesForm.formInput}
                  value={tradeLocation}
                  onChange={(e) => setTradeLocation(e.target.value)}
                  placeholder="거래지역 입력"
                />
              </div>
            </li>
          </ul>
        </section>
      </main>

      {/* ✅ stylesLayout 및 stylesButtons 사용 */}
      <footer className={stylesLayout.registerFooter}>
        <div className={stylesLayout.inner}>
          <div className={stylesButtons["btn-group"]}>
            <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft}>
              임시저장
            </button>
            <button type="submit" className={stylesButtons.btnSubmit} onClick={handleSubmit}>
              등록하기
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default ProductRegister;