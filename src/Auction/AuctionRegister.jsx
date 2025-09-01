// src/Auction/AuctionRegister.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { whoAmI, createAuctionPost, uploadAuctionImages } from '../api/auction';
import stylesLayout from '../AuctionCSS/AuctionRegisterLayout.module.css';
import stylesForm from '../AuctionCSS/AuctionRegisterForm.module.css';
import stylesButtons from '../AuctionCSS/AuctionRegisterButtons.module.css';

function AuctionRegister() {
  const navigate = useNavigate();

  // 인증 체크
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    console.log('[auth] token present?', !!token);

    whoAmI()
      .then((me) => {
        console.log('[auth] /api/auth/me =>', me);
        if (!me?.authenticated) {
          alert('로그인이 필요합니다.');
          navigate('/login');
        }
      })
      .catch((e) => {
        console.log('[auth] me error', e?.response?.status, e?.response?.data);
        alert('로그인이 필요합니다.');
        navigate('/login');
      });
  }, [navigate]);

  // 이미지: File과 미리보기 URL 둘 다 관리
  const [imageFiles, setImageFiles] = useState([]);      // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]
  const maxImages = 12;

  // 기본 정보
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionContent, setAuctionContent] = useState('');
  // 경매 정보
  const [startCost, setStartCost] = useState('');
  const [buyoutCost, setBuyoutCost] = useState('');
  const [startTime, setStartTime] = useState(''); // yyyy-MM-ddTHH:mm
  const [endTime, setEndTime] = useState('');

  // 상태
  const [submitting, setSubmitting] = useState(false);

  // ✅ 카테고리 (ProductForm 방식: 루트 → 자식 로드)
  const [largeCategories, setLargeCategories] = useState([]); // [{id, name}]
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);   // id
  const [selectedMiddle, setSelectedMiddle] = useState(null); // id
  const [selectedSmall, setSelectedSmall] = useState(null);   // id

  // 대분류 로드
  useEffect(() => {
    axios.get('/api/categories/roots')
      .then(res => setLargeCategories(res.data || []))
      .catch(() => setLargeCategories([]));
  }, []);

  // 클릭 핸들러
  const handleLargeCategoryClick = async (categoryId) => {
    setSelectedLarge(categoryId);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    try {
      const res = await axios.get(`/api/categories/${categoryId}`); // 중분류 로드
      setMiddleCategories(res.data || []);
    } catch {
      setMiddleCategories([]);
    }
  };

  const handleMiddleCategoryClick = async (categoryId) => {
    setSelectedMiddle(categoryId);
    setSelectedSmall(null);
    try {
      const res = await axios.get(`/api/categories/${categoryId}`); // 소분류 로드
      setSmallCategories(res.data || []);
    } catch {
      setSmallCategories([]);
    }
  };

  const handleSmallCategoryClick = (categoryId) => setSelectedSmall(categoryId);

  // 선택된 카테고리 경로 텍스트
  const categoryText = useMemo(() => {
    const largeName  = largeCategories.find(c => c.id === selectedLarge)?.name;
    const middleName = middleCategories.find(c => c.id === selectedMiddle)?.name;
    const smallName  = smallCategories.find(c => c.id === selectedSmall)?.name;
    return [largeName, middleName, smallName].filter(Boolean).join(' > ');
  }, [largeCategories, middleCategories, smallCategories, selectedLarge, selectedMiddle, selectedSmall]);

  // 이미지 선택
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const allowed = files.filter(
      f => /image\/(png|jpeg|jpg)/i.test(f.type) && f.size <= MAX_SIZE
    );
    if (allowed.length < files.length) {
      alert('PNG/JPG만 가능하며, 파일당 5MB 이하만 업로드됩니다.');
    }

    const totalNow = imageFiles.length;
    const remain = maxImages - totalNow;
    const next = allowed.slice(0, Math.max(0, remain));

    const nextFiles = [...imageFiles, ...next];
    const newPreviews = next.map(f => URL.createObjectURL(f));
    const nextPreviews = [...imagePreviews, ...newPreviews];

    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
  };

  // 이미지 제거
  const handleRemoveImage = (idx) => {
    const nextFiles = imageFiles.filter((_, i) => i !== idx);
    const nextPreviews = imagePreviews.filter((_, i) => i !== idx);

    // blob URL 정리
    const removed = imagePreviews[idx];
    if (removed && removed.startsWith('blob:')) {
      try { URL.revokeObjectURL(removed); } catch (_) {}
    }

    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
  };

  // (선택) 간단 정렬: 썸네일 클릭으로 앞으로 보내기
  const moveImageToFront = (idx) => {
    if (idx <= 0) return;
    const f = imageFiles[idx];
    const p = imagePreviews[idx];
    const nextFiles = [f, ...imageFiles.filter((_, i) => i !== idx)];
    const nextPreviews = [p, ...imagePreviews.filter((_, i) => i !== idx)];
    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
  };

  // previews가 바뀔 때 이전 URL 해제
  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => {
        if (typeof u === 'string' && u.startsWith('blob:')) {
          try { URL.revokeObjectURL(u); } catch (_) {}
        }
      });
    };
  }, [imagePreviews]);

  // 프론트 유효성 검증
  const validate = () => {
    if (!auctionTitle.trim()) return '상품명을 입력해 주세요.';
    if (!auctionContent.trim() || auctionContent.trim().length < 10) return '상품 설명은 10자 이상 입력해 주세요.';
    if (!selectedSmall) return '카테고리를 선택해 주세요.'; // ✅ 소분류 필수
    if (!startCost || Number(startCost) <= 0) return '시작가를 올바르게 입력해 주세요.';
    if (buyoutCost && Number(buyoutCost) <= Number(startCost)) return '즉시 구매가는 시작가보다 커야 합니다.';
    if (!startTime || !endTime) return '경매 시작/종료 시간을 모두 입력해 주세요.';
    const st = new Date(startTime);
    const et = new Date(endTime);
    if (isNaN(st.getTime()) || isNaN(et.getTime())) return '시간 형식을 확인해 주세요.';
    if (st >= et) return '종료 시간은 시작 시간보다 늦어야 합니다.';
    if (!imageFiles.length) return '이미지는 최소 1장 이상 등록해 주세요.';
    if (imageFiles.length > maxImages) return `이미지는 최대 ${maxImages}장까지 등록 가능합니다.`;
    return null;
  };

  const handleSubmitAuction = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    try {
      setSubmitting(true);

      // 1) 본문 생성
      const { auctionId, message } = await createAuctionPost({
        title: auctionTitle.trim(),
        content: auctionContent.trim(),
        startCost: Number(startCost),
        buyoutCost: buyoutCost ? Number(buyoutCost) : null,
        startTime,
        endTime,
        categoryId: Number(selectedSmall),
      });

      // 2) 이미지 업로드 (정렬 순서: 현재 배열 순서를 1부터 부여)
      const sortOrder = imageFiles.map((_, i) => i + 1);
      await uploadAuctionImages(auctionId, imageFiles, sortOrder);

      alert(message ?? '경매 상품이 등록되었습니다.');
      navigate(`/auction/detail/${auctionId}`);
    } catch (e) {
      console.error(e);
      alert('일부 단계에서 오류가 발생했습니다. 이미지 재업로드를 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // 간단 예시: localStorage 임시저장
    const draft = {
      auctionTitle, auctionContent,
      selectedLarge, selectedMiddle, selectedSmall,
      startCost, buyoutCost, startTime, endTime,
      // 이미지 File은 직렬화 불가 → 필요하면 IndexedDB 사용
    };
    localStorage.setItem('auction_draft', JSON.stringify(draft));
    alert('임시 저장되었습니다.');
  };

  return (
    <div className={stylesLayout.auctionRegisterPage}>
      <main className={stylesLayout.mainContent}>
        <section className={stylesLayout.section}>
          <h1 className={stylesLayout.pageTitle}>경매 상품 등록</h1>
          <h2 className={stylesLayout.sectionTitle}>경매 상품 정보 입력</h2>

          <ul className={stylesLayout.formGroups}>
            {/* 이미지 업로드 */}
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>
                상품 이미지 <small>({imageFiles.length}/{maxImages})</small>
              </div>
              <div className={stylesLayout.formContent}>
                <ul className={stylesForm.imageUploadList}>
                  <li className={`${stylesForm.imageUploadItem} ${stylesForm.addImage} ${imageFiles.length >= maxImages ? stylesForm.disabled : ''}`}>
                    <label htmlFor="image-upload-input">
                      <span>이미지 등록</span>
                    </label>
                    <input
                      id="image-upload-input"
                      type="file"
                      accept="image/jpg, image/jpeg, image/png"
                      multiple
                      onChange={handleImageChange}
                      disabled={imageFiles.length >= maxImages}
                      style={{ display: 'none' }}
                    />
                  </li>

                  {imagePreviews.map((src, idx) => (
                    <li key={idx} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img
                        src={src}
                        alt={`상품 이미지 ${idx + 1}`}
                        onClick={() => moveImageToFront(idx)}
                        title="클릭하면 첫 번째로 이동"
                      />
                      <button
                        type="button"
                        className={stylesForm.removeImageButton}
                        onClick={() => handleRemoveImage(idx)}
                        aria-label="이미지 삭제"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={stylesForm.formHint}>
                  최대 {maxImages}장, PNG/JPG만 가능. 썸네일을 클릭하면 1번으로 이동합니다.
                </div>
              </div>
            </li>

            {/* 상품명 */}
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
                    {largeCategories.length === 0 ? (
                      <li className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>카테고리 불러오는 중...</li>
                    ) : (
                      largeCategories.map((cat) => (
                        <li key={cat.id} className={`${stylesForm.categoryItem} ${selectedLarge === cat.id ? stylesForm.active : ''}`}>
                          <button type="button" onClick={() => handleLargeCategoryClick(cat.id)} aria-selected={selectedLarge === cat.id}>
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
                            <button type="button" onClick={() => handleMiddleCategoryClick(cat.id)} aria-selected={selectedMiddle === cat.id}>
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
                            <button type="button" onClick={() => handleSmallCategoryClick(cat.id)} aria-selected={selectedSmall === cat.id}>
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
              {categoryText && <div className={stylesForm.formHint}>선택됨: {categoryText}</div>}
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

            {/* 즉시 구매가 (선택) */}
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
                    min={startCost ? Number(startCost) + 1 : 1}
                  />
                  <span className={stylesForm.currency}>원</span>
                </div>
              </div>
            </li>

            {/* 시간 */}
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

            {/* 설명 */}
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
                  minLength={10}
                />
                <div className={stylesForm.charCounter}>{auctionContent.length}/2000</div>
              </div>
            </li>
          </ul>
        </section>
      </main>

      <footer className={stylesButtons.footer}>
        <button type="button" className={stylesButtons.btnDraft} onClick={handleSaveDraft} disabled={submitting}>
          임시저장
        </button>
        <button type="submit" className={stylesButtons.btnSubmit} onClick={handleSubmitAuction} disabled={submitting}>
          {submitting ? '등록 중…' : '경매 등록하기'}
        </button>
      </footer>
    </div>
  );
}

export default AuctionRegister;
