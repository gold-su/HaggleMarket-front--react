// src/Product/ProductForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { whoAmI } from '../api/auction';

import stylesLayout from '../ProductCSS/ProductFormLayout.module.css';
import stylesForm from '../ProductCSS/ProductFormInputs.module.css';
import stylesButtons from '../ProductCSS/ProductFormButtons.module.css';

function ProductForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    whoAmI().catch(() => {
      alert('로그인이 필요합니다.');
      navigate('/login');
    });
  }, [token, navigate]);

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
  const [productName, setProductName] = useState('');
  const [productStatus, setProductStatus] = useState('LIKE_NEW');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('별도');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [tradeLocation, setTradeLocation] = useState('');
  const [tags, setTags] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const MAX_DESC = 2000;

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

  // edit 데이터 로드
  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    axios.get(`/api/products/detail/${id}`)
      .then(async (res) => {
        const data = res.data || {};
        setProductName(data.title || '');
        setPrice(data.cost ?? '');
        setDescription(data.content || '');
        setProductStatus(data.productStatus || 'LIKE_NEW');
        setNegotiable(!!data.negotiable);
        setDeliveryFee(data.deliveryFee ? '포함' : '별도');
        setTags(data.tag || '');
        setTradeLocation(data.seller?.address || '');

        const imgs = Array.isArray(data.images) ? data.images : [];
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
      })
      .catch(e => console.error('게시글 로딩 실패', e));
  }, [mode, id]);

  // 이미지 업로드/제거
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const total = existingImageUrls.length + imagePreviews.length;
    const remain = Math.max(0, 12 - total);
    const picked = files.slice(0, remain);
    const newURLs = picked.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...picked]);
    setImagePreviews(prev => [...prev, ...newURLs]);
  };

  const handleRemoveImage = (index) => {
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const pIdx = index - existingImageUrls.length;
      setImagePreviews(prev => {
        const url = prev[pIdx];
        if (url?.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch (_) { }
        }
        return prev.filter((_, i) => i !== pIdx);
      });
      setImages(prev => prev.filter((_, i) => i !== pIdx));
    }
  };

  // Blob URL 정리
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch (_) { }
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers = useMemo(() => {
    if (!token) return undefined;
    // 서버 인증 방식에 맞춰 Authorization 헤더를 조정하세요.
    return { Authorization: `Bearer ${token}` };
    // 예) return { Authorization: token }; 또는 { 'X-AUTH-TOKEN': token };
  }, [token]);

  // 임시저장
  const draftKey = (mode === 'edit' && id) ? `productDraft:${id}` : 'productDraft:new';
  const handleSaveDraft = () => {
    const draft = {
      savedAt: new Date().toISOString(),
      mode, id: mode === 'edit' ? id : null,
      productName, productStatus, price, negotiable, deliveryFee,
      description, contact, tradeLocation, tags,
      selectedLarge, selectedMiddle, selectedSmall,
      existingImageUrls,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      alert('임시 저장되었습니다.');
    } catch (e) {
      console.error('임시 저장 실패:', e);
      alert('임시 저장에 실패했습니다.');
    }
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    console.log('headers', headers);

    if (!productName.trim()) return alert('상품명을 입력해 주세요.');
    if (!selectedSmall) return alert('카테고리를 선택해 주세요.');
    if (!(Number(price) > 0)) return alert('가격은 0보다 큰 숫자여야 합니다.');
    if (description.trim().length < 10) return alert('상품 설명은 10자 이상 입력해 주세요.');

    try {
      setSubmitting(true);

      let uploaded = [];
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((f) => fd.append('images', f));
        const res = await axios.post('/api/products/images', fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
        uploaded = res.data || [];
      }

      const dto = {
        title: productName.trim(),
        cost: Number(price),
        content: description.trim(),
        negotiable,
        deliveryFee: deliveryFee === '포함',
        productStatus,
        imageUrls: [...existingImageUrls, ...uploaded],
        categoryId: selectedSmall,
        tag: tags,
        tradeLocation,
        contact,
      };

      if (mode === 'edit' && id) {
        await axios.put(`/api/products/${id}`, dto, { headers: { ...headers, 'Content-Type': 'application/json' } });
        alert('수정 완료!');
        navigate(`/products/detail/${id}`);
      } else {
        const res = await axios.post('/api/products', dto, { headers: { ...headers, 'Content-Type': 'application/json' } });
        const newId = res?.data?.postId ?? res?.data?.id;
        alert('등록 완료!');
        if (newId) navigate(`/products/detail/${newId}`); else navigate(-1);
      }
    } catch (err) {
      console.error('저장 실패:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmit} noValidate>
          <section className={stylesLayout.registerSection}>
            <h1 className={stylesLayout.registerTitle}>상품 등록</h1>

            <ul className={stylesLayout.formGroups}>
              {/* 상품 이미지 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>상품 이미지</div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    <li
                      className={`${stylesForm.imageUploadItem} ${stylesForm.addImage} ${existingImageUrls.length + imagePreviews.length >= 12 ? stylesForm.disabled : ''
                        }`}
                    >
                      <label htmlFor="image-upload-input">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

              {/* 상품 명 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>상품 명</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="상품명을 입력해 주세요."
                    maxLength={40}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <div className={stylesForm.charCounter}>{productName.length}/40</div>
                </div>
              </li>

              {/* 카테고리 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>카테고리</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.categorySelectionArea}>
                    <div className={stylesForm.categoryColumn}>
                      <ul className={stylesForm.categoryList}>
                        {largeCategories.length === 0 ? (
                          <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>카테고리 불러오는 중...</li>
                        ) : (
                          largeCategories.map((cat) => (
                            <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedLarge === cat.id ? stylesForm.active : ''}`}>
                              <button type="button" onClick={() => handleLargeChange(cat.id)} aria-selected={selectedLarge === cat.id}>{cat.name}</button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div className={stylesForm.categoryColumn}>
                      {selectedLarge ? (
                        middleCategories.length === 0 ? (
                          <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 없음</div>
                        ) : (
                          <ul className={stylesForm.categoryList}>
                            {middleCategories.map((cat) => (
                              <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedMiddle === cat.id ? stylesForm.active : ''}`}>
                                <button type="button" onClick={() => handleMiddleChange(cat.id)} aria-selected={selectedMiddle === cat.id}>{cat.name}</button>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 선택</div>
                      )}
                    </div>

                    <div className={stylesForm.categoryColumn}>
                      {selectedMiddle ? (
                        smallCategories.length === 0 ? (
                          <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 없음</div>
                        ) : (
                          <ul className={stylesForm.categoryList}>
                            {smallCategories.map((cat) => (
                              <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedSmall === cat.id ? stylesForm.active : ''}`}>
                                <button type="button" onClick={() => handleSmallChange(cat.id)} aria-selected={selectedSmall === cat.id}>{cat.name}</button>
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
                      { label: '새 상품 (미사용)', value: 'NEW' },
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

              {/* 상품 설명 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>상품 설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="상품 설명을 입력해주세요. (최소 10자)"
                    rows={8}
                    required
                    minLength={10}
                    maxLength={MAX_DESC}
                    aria-describedby="desc-counter"
                  />
                  <div id="desc-counter" className={stylesForm.charCounter}>
                    {description.length}/{MAX_DESC}
                  </div>
                </div>
              </li>

              {/* 태그 (선택) */}
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

              {/* 섹션 타이틀: 가격 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>가격</h2>
              </li>

              {/* 가격 */}
              <li className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}>
                <div className={stylesLayout.formLabel}>가격</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="가격을 입력해 주세요."
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        min={1}
                        step={1}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-label="가격"
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>
                    <label className={`${stylesForm.checkboxLabel} ${stylesForm.checkboxRight}`}>
                      <input
                        type="checkbox"
                        checked={negotiable}
                        onChange={(e) => setNegotiable(e.target.checked)}
                      />
                      가격 제안 받기
                    </label>
                  </div>
                </div>
              </li>

              {/* 섹션 타이틀: 택배거래 */}
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

              {/* 섹션 타이틀: 추가정보 */}
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

          <footer className={stylesLayout.registerFooter}>
            <div className={stylesLayout.inner}>
              <div className={stylesButtons.btnGroup}>
                <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft} disabled={submitting}>임시저장</button>
                <button type="submit" className={stylesButtons.btnSubmit} disabled={submitting} aria-disabled={submitting}>
                  {submitting ? (mode === 'edit' ? '수정 중…' : '등록 중…') : (mode === 'edit' ? '수정하기' : '등록하기')}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default ProductForm;