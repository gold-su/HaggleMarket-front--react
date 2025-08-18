// src/Auction/AuctionEdit.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

import stylesLayout from '../ProductCSS/ProductFormLayout.module.css';
import stylesForm from '../ProductCSS/ProductFormInputs.module.css';
import stylesButtons from '../ProductCSS/ProductFormButtons.module.css';

function AuctionEdit() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

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
  const [imagePreviews, setImagePreviews] = useState([]);

  // 폼 필드
  const [title, setTitle] = useState('');
  const [productStatus, setProductStatus] = useState('LIKE_NEW');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [bidUnit, setBidUnit] = useState('1000');
  const [deliveryFee, setDeliveryFee] = useState('별도');
  const [tradeLocation, setTradeLocation] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_DESC = 2000;

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token]
  );

  // 카테고리 로드
  useEffect(() => {
    axios.get('/api/categories/roots')
      .then(res => setLargeCategories(res.data || []))
      .catch(() => setLargeCategories([]));
  }, []);

  const handleLargeChange = (categoryId) => {
    setSelectedLarge(categoryId);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    axios.get(`/api/categories/${categoryId}`)
      .then(res => setMiddleCategories(res.data || []))
      .catch(() => setMiddleCategories([]));
  };
  const handleMiddleChange = (categoryId) => {
    setSelectedMiddle(categoryId);
    setSelectedSmall(null);
    axios.get(`/api/categories/${categoryId}`)
      .then(res => setSmallCategories(res.data || []))
      .catch(() => setSmallCategories([]));
  };
  const handleSmallChange = (categoryId) => setSelectedSmall(categoryId);

  // 상세 로드
  useEffect(() => {
    if (!auctionId) return;
    (async () => {
      try {
        // 상세 엔드포인트는 프로젝트 스펙에 맞게 조정하세요.
        const res = await axios.get(`/api/auctions/${auctionId}`, { headers });
        const data = res.data || {};

        setTitle(data.title || '');
        setProductStatus(data.productStatus || 'LIKE_NEW');
        setDescription(data.description || '');
        setTags(data.tag || '');
        setStartPrice(String(data.startPrice ?? ''));
        setBuyNowPrice(data.buyNowPrice == null ? '' : String(data.buyNowPrice));
        setBidUnit(String(data.bidUnit ?? '1000'));
        setDeliveryFee(data.deliveryFeeIncluded ? '포함' : '별도');
        setTradeLocation(data.tradeLocation || '');
        setContact(data.contact || '');

        const imgs = Array.isArray(data.imageUrls) ? data.imageUrls
          : Array.isArray(data.images) ? data.images : [];
        setExistingImageUrls(imgs);

        if (data.categoryId) {
          try {
            const smallRes = await axios.get(`/api/categories/detail/${data.categoryId}`);
            const middleId = smallRes.data.parent.id;

            const middleRes = await axios.get(`/api/categories/detail/${middleId}`);
            const largeId = middleRes.data.parent.id;

            const largeList = await axios.get('/api/categories/roots');
            setLargeCategories(largeList.data);
            setSelectedLarge(largeId);

            const middleList = await axios.get(`/api/categories/${largeId}`);
            setMiddleCategories(middleList.data);
            setSelectedMiddle(middleId);

            const smallList = await axios.get(`/api/categories/${middleId}`);
            setSmallCategories(smallList.data);
            setSelectedSmall(data.categoryId);
          } catch (e) {
            console.error('카테고리 자동 세팅 실패', e);
          }
        }
      } catch (e) {
        console.error('경매 상세 로드 실패', e);
        alert('경매 정보를 불러오지 못했습니다.');
        navigate(-1);
      }
    })();
  }, [auctionId, headers, navigate]);

  // 이미지 업로드/제거
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const total = existingImageUrls.length + imagePreviews.length;
    const remain = Math.max(0, 12 - total);
    const picked = files.slice(0, remain);
    const urls = picked.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...picked]);
    setImagePreviews(prev => [...prev, ...urls]);
  };
  const handleRemoveImage = (index) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const pIdx = index - existingImageUrls.length;
      setImagePreviews(prev => {
        const url = prev[pIdx];
        if (url?.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch {}
        }
        return prev.filter((_, i) => i !== pIdx);
      });
      setImages(prev => prev.filter((_, i) => i !== pIdx));
    }
  };
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 임시저장
  const handleSaveDraft = () => {
    const draft = {
      savedAt: new Date().toISOString(),
      title, productStatus, description, tag: tags,
      startPrice, buyNowPrice, bidUnit,
      deliveryFee, selectedLarge, selectedMiddle, selectedSmall,
      tradeLocation, contact, existingImageUrls,
    };
    try {
      localStorage.setItem(`auctionDraft:${auctionId}`, JSON.stringify(draft));
      alert('임시 저장되었습니다.');
    } catch {
      alert('임시 저장에 실패했습니다.');
    }
  };

  // 제출(수정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim()) return alert('경매 제목을 입력해 주세요.');
    if (!selectedSmall) return alert('카테고리를 선택해 주세요.');
    if (!(Number(startPrice) > 0)) return alert('시작가는 0보다 큰 숫자여야 합니다.');
    if (buyNowPrice && Number(buyNowPrice) <= Number(startPrice)) return alert('즉시구매가는 시작가보다 커야 합니다.');
    if (description.trim().length < 10) return alert('상세 설명은 10자 이상 입력해 주세요.');

    try {
      setSubmitting(true);

      // 신규 이미지 업로드(있을 때만)
      let uploaded = [];
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(f => fd.append('images', f));
        const res = await axios.post('/api/auctions/images', fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
        uploaded = res.data || [];
      }

      const dto = {
        title: title.trim(),
        productStatus,
        description: description.trim(),
        tag: tags,
        startPrice: Number(startPrice),
        buyNowPrice: buyNowPrice ? Number(buyNowPrice) : null,
        bidUnit: Number(bidUnit) || 0,
        deliveryFeeIncluded: deliveryFee === '포함',
        categoryId: selectedSmall,
        imageUrls: [...existingImageUrls, ...uploaded],
        tradeLocation,
        contact,
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
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmit} noValidate>
          <section className={stylesLayout.registerSection}>
            <h1 className={stylesLayout.registerTitle}>경매 수정</h1>

            <ul className={stylesLayout.formGroups}>
              {/* 이미지 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>경매 이미지</div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    <li
                      className={`${stylesForm.imageUploadItem} ${stylesForm.addImage} ${
                        existingImageUrls.length + imagePreviews.length >= 12 ? stylesForm.disabled : ''
                      }`}
                    >
                      <label htmlFor="auction-edit-image-input">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>이미지 등록</span>
                      </label>
                      <input
                        id="auction-edit-image-input"
                        type="file"
                        accept="image/jpg, image/jpeg, image/png"
                        multiple
                        onChange={handleImageChange}
                        disabled={existingImageUrls.length + imagePreviews.length >= 12}
                        style={{ display: 'none' }}
                      />
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
    </div>
  );
}

export default AuctionEdit;