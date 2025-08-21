// src/Auction/AuctionEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams 추가
import stylesLayout from '../AuctionCSS/AuctionEditLayout.module.css'; // ✅ 새 레이아웃 CSS
import stylesForm from '../AuctionCSS/AuctionEditForm.module.css';     // ✅ 새 폼 CSS
import stylesButtons from '../AuctionCSS/AuctionEditButtons.module.css'; // ✅ 새 버튼 CSS

import { fetchAuctionDetail, updateAuctionPost, uploadAuctionImages, BASE } from '../api/auction';

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

import stylesLayout from '../ProductCSS/ProductFormLayout.module.css';
import stylesForm from '../ProductCSS/ProductFormInputs.module.css';
import stylesButtons from '../ProductCSS/ProductFormButtons.module.css';

function AuctionEdit() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const params = useParams();
  const auctionId = params.auctionId ?? params.id; // 라우트에 맞게 통일 //  URL 파라미터에서 경매 ID 가져오기

  // 카테고리
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  // 이미지(기존/신규/프리뷰)
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [images, setImages] = useState([]);
  const [auctionTitle, setAuctionTitle] = useState(''); // 상품명
  const [auctionContent, setAuctionContent] = useState(''); // 상품 설명
  const [selectedLargeCategory, setSelectedLargeCategory] = useState('');
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState('');
  const [selectedSmallCategory, setSelectedSmallCategory] = useState('');
  const [startCost, setStartCost] = useState(''); // 시작가
  const [buyoutCost, setBuyoutCost] = useState(''); // 즉시 구매가 (선택 사항)
  const [startTime, setStartTime] = useState(''); // 경매 시작 시간
  const [endTime, setEndTime] = useState('');     // 경매 종료 시간
  const [canEdit, setCanEdit] = useState(true);

  const MAX_DESC = 2000;

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  // 카테고리 로드
  useEffect(() => {
    if (auctionId) {
      // 실제 API 호출을 통해 해당 auctionId의 상품 데이터를 불러와 폼을 채웁니다.
      // 지금은 더미 데이터로 대체합니다.
      const fetchAuctionData = async () => {
        // 실제로는 여기에서 fetch('/api/auctions/' + auctionId) 등을 호출합니다.
        try {
          const data = await fetchAuctionDetail(auctionId);
          // 이미지 URL 배열 가정(imagesUrls/imageUrls)
          const rawUrls = data.imagesUrls ?? data.imageUrls ?? [];
          const abs = Array.isArray(rawUrls)
            ? rawUrls.map((u) => (u.startsWith('http') ? u : `${BASE}${u}`))
            : [];
          setImages(abs.map((url) => ({ preview: url, existingUrl: url, isNew: false })));
          setAuctionTitle(data.title ?? '');
          setAuctionContent(data.content ?? '');
          setStartCost(data.startCost ?? data.startPrice ?? 0);
          setBuyoutCost(data.buyoutCost ?? data.buyoutPrice ?? '');
          // datetime-local은 초가 없어도 OK: "YYYY-MM-DDTHH:mm"
          setStartTime((data.startTime ?? '').slice(0, 16));
          setEndTime((data.endTime ?? '').slice(0, 16));
          const hasBids = (data.bidCount ?? 0) > 0;
          // status가 내려오면 READY 외엔 수정 금지:
          // const notReady = data.status && data.status !== 'READY';
          setCanEdit(!hasBids /* && !notReady */);
          // 카테고리는 프로젝트 정책 따라서 매핑
        } catch (e) {
          alert('경매 정보를 불러오는 데 실패했습니다.');
          //navigate(-1);
        }
      };

      await axios.put(`/api/auctions/${auctionId}`, dto, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      alert('경매 정보가 수정되었습니다.');
      navigate(-1);
    } catch (err) {
      console.error('경매 수정 실패:', err);
      alert('수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [auctionId, navigate]); // auctionId가 변경될 때마다 데이터를 다시 불러옵니다.


  // === 기존 이미지 핸들러 ===
  const handleImageChange = (e) => {
    if (!e.target.files) return;
    const toAdd = Array.from(e.target.files).map(file => ({
      preview: URL.createObjectURL(file),
      file,
      isNew: true,
    }));
    setImages(prev => [...prev, ...toAdd].slice(0, 12));
    e.target.value = ''; // 같은 파일 재선택 허용
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
  const handleUpdateAuction = async (e) => {
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

    if (!auctionTitle || !auctionContent || !startTime || !endTime) {
      alert("필수 입력 사항을 모두 채워주세요.");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert("경매 종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }


    // 서버로 보낼 payload (PUT: 수정 가능한 필드만)
    const payload = {
      title: auctionTitle,
      content: auctionContent,
      buyoutCost: buyoutCost === '' ? null : Number(buyoutCost), // '' → null로
      startTime, // "YYYY-MM-DDTHH:mm" 형식 OK (백엔드 LocalDateTime)
      endTime,
      // startCost는 보통 수정 금지. 정말 필요하면 백엔드가 허용하는지 확인하고 아래 라인 주석 해제.
      // startCost: Number(startCost),
    };

    try {
      // 1) 본문 수정
      const res = await updateAuctionPost(auctionId, payload);
      console.log('updateAuctionPost:', res);

      // 2) 신규 이미지만 업로드
      const newFiles = images
        .filter((it) => it.isNew && it.file instanceof File)
        .map((it) => it.file);
      if (newFiles.length > 0) {
        // 정렬 순서: 현재 배열 순서대로 1..N
        const sortOrders = images
          .map((it, idx) => (it.isNew ? idx + 1 : null))
          .filter((v) => v !== null);
        const up = await uploadAuctionImages(auctionId, newFiles, sortOrders);
        console.log('uploadAuctionImages:', up);
      }

      alert(res?.message ?? '경매 상품이 수정되었습니다.');
      navigate(-1);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;
      if (status === 401) alert('로그인이 필요합니다.');
      else if (status === 403) alert('본인 게시글만 수정할 수 있습니다.');
      else if (status === 409) alert('입찰자가 있거나 수정할 수 없는 상태입니다.');
      else if (status === 400) alert(msg ?? '요청 값이 올바르지 않습니다.');
      else alert(msg ?? '수정 중 오류가 발생했습니다.');
    }


  };

  const handleSaveDraft = () => {
    // TODO: 로컬스토리지/백엔드 임시저장 API로 바꿔도 됨
    alert('임시 저장되었습니다.');
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmit} noValidate>
          <section className={stylesLayout.registerSection}>
            <h1 className={stylesLayout.registerTitle}>경매 수정</h1>

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
                  {images.map((img, index) => (
                    <li key={index} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img src={img.preview} alt={`상품 이미지 ${index + 1}`} />
                      <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(index)}>X</button>
                    </li>

                    {existingImageUrls.map((url, idx) => (
                      <li key={`exist-${idx}`} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                        <img src={`http://localhost:8080${url}`} alt={`기존 이미지 ${idx + 1}`} />
                        <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(idx)} aria-label="이미지 삭제">×</button>
                      </li>
                    ))}

                    {imagePreviews.map((src, idx) => (
                      <li key={`blob-${idx}`} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                        <img src={src} alt={`미리보기 ${idx + 1}`} />
                        <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(existingImageUrls.length + idx)} aria-label="이미지 삭제">×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* 제목 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>경매 제목</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="경매 제목을 입력해 주세요."
                    maxLength={60}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </li>

              {/* 카테고리 (컴팩트 + #fff 적용) */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>카테고리</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.categorySelectionArea}>
                    {/* 대분류 */}
                    <div className={stylesForm.categoryColumn}>
                      <ul className={stylesForm.categoryList}>
                        {largeCategories.length === 0 ? (
                          <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>카테고리 불러오는 중...</li>
                        ) : (
                          largeCategories.map((cat) => (
                            <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedLarge === cat.id ? stylesForm.active : ''}`}>
                              <button type="button" onClick={() => handleLargeChange(cat.id)} aria-selected={selectedLarge === cat.id}>
                                {cat.name}
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* 중분류 */}
                    <div className={stylesForm.categoryColumn}>
                      {selectedLarge ? (
                        middleCategories.length === 0 ? (
                          <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 없음</div>
                        ) : (
                          <ul className={stylesForm.categoryList}>
                            {middleCategories.map((cat) => (
                              <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedMiddle === cat.id ? stylesForm.active : ''}`}>
                                <button type="button" onClick={() => handleMiddleChange(cat.id)} aria-selected={selectedMiddle === cat.id}>
                                  {cat.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 선택</div>
                      )}
                    </div>

                    {/* 소분류 */}
                    <div className={stylesForm.categoryColumn}>
                      {selectedMiddle ? (
                        smallCategories.length === 0 ? (
                          <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 없음</div>
                        ) : (
                          <ul className={stylesForm.categoryList}>
                            {smallCategories.map((cat) => (
                              <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedSmall === cat.id ? stylesForm.active : ''}`}>
                                <button type="button" onClick={() => handleSmallChange(cat.id)} aria-selected={selectedSmall === cat.id}>
                                  {cat.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 선택</div>
                      )}
                    </div>
                  </div>
                </div>
              </li>

              {/* 상품 상태 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>상품 상태</div>
                <div className={stylesLayout.formContent}>
                  <div className={`${stylesForm.radioGroup} ${stylesForm.radioGroupVertical}`}>
                    {[
                      { label: '새 상품 (미사용)', value: 'LIKE_NEW' },
                      { label: '사용감 없음', value: 'USED_LIKE_NEW' },
                      { label: '사용감 적음', value: 'USED_GOOD' },
                      { label: '사용감 많음', value: 'USED' },
                      { label: '고장/파손 상품', value: 'DAMAGED' },
                    ].map(item => (
                      <label key={item.value} className={stylesForm.radioLabel}>
                        <input
                          type="radio"
                          name="productStatus"
                          value={item.value}
                          checked={productStatus === item.value}
                          onChange={() => setProductStatus(item.value)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </li>

              {/* 상세 설명 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>상세 설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="경매 물품에 대한 상세 설명을 입력해 주세요. (최소 10자)"
                    rows={8}
                    required
                    minLength={10}
                    maxLength={MAX_DESC}
                  />
                  <div className={stylesForm.charCounter}>{description.length}/{MAX_DESC}</div>
                </div>
              </li>

              {/* 태그(선택) */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>태그 (선택)</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="쉼표로 구분해 입력 (예: 빈티지, 시계)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </li>

              {/* 가격 타이틀 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>가격</h2>
              </li>

              {/* 시작가 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>시작가</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="시작가"
                        value={startPrice}
                        onChange={(e) => setStartPrice(e.target.value)}
                        required
                        min={1}
                        step={1000}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-label="시작가"
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* 즉시구매가(선택) */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>즉시구매가(선택)</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="즉시구매가"
                        value={buyNowPrice}
                        onChange={(e) => setBuyNowPrice(e.target.value)}
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-label="즉시구매가"
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* 입찰 단위 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>입찰 단위</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="입찰 단위"
                        value={bidUnit}
                        onChange={(e) => setBidUnit(e.target.value)}
                        required
                        min={1}
                        step={1000}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-label="입찰 단위"
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* 택배거래 타이틀 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>택배거래</h2>
              </li>

              {/* 배송비 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>배송비</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.radioGroup}>
                    {['포함', '별도'].map(fee => (
                      <label key={fee} className={stylesForm.radioLabel}>
                        <input
                          type="radio"
                          name="deliveryFee"
                          value={fee}
                          checked={deliveryFee === fee}
                          onChange={() => setDeliveryFee(fee)}
                        />
                        <span>{fee}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </li>

              {/* 추가정보 타이틀 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>추가정보</h2>
              </li>

              {/* 직거래 지역 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>직거래 지역</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="예) 서울 강남구"
                    value={tradeLocation}
                    onChange={(e) => setTradeLocation(e.target.value)}
                  />
                </div>
              </li>

              {/* 연락(맨 아래) */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>연락</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="전화번호 또는 메신저 ID"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </li>
            </ul>
          </section>

          {/* 하단 버튼 */}
          <footer className={stylesLayout.registerFooter}>
            <div className={stylesLayout.inner}>
              <div className={stylesButtons.btnGroup}>
                <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft} disabled={submitting}>임시저장</button>
                <button type="submit" className={stylesButtons.btnSubmit} disabled={submitting}>
                  {submitting ? '수정 중…' : '수정하기'}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </main>

      <footer className={stylesButtons.footer}>
        <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft}>임시저장</button>
        {/* 제출 버튼은 업데이트 함수로 연결 */}
        <button
          type="submit"
          className={stylesButtons.btnSubmit}

          onClick={handleUpdateAuction}
          disabled={!canEdit}
        >
          경매 수정하기
        </button>
        {!canEdit && <div className={stylesForm.lockNotice}>입찰자가 있어 수정할 수 없습니다.</div>}
      </footer>
    </div >
  );
}

export default AuctionEdit;