// src/Auction/AuctionRegister.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import stylesLayout from '../AuctionCSS/AuctionRegisterLayout.module.css';
import stylesForm from '../AuctionCSS/AuctionRegisterForm.module.css';
import stylesButtons from '../AuctionCSS/AuctionRegisterButtons.module.css';

function AuctionRegister() {
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;

  // 카테고리
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  // 이미지(신규/미리보기)
  const [images, setImages] = useState([]);               // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]

  // 폼 필드
  const [title, setTitle] = useState('');
  const [startCost, setStartCost] = useState('');
  const [buyoutCost, setBuyoutCost] = useState(''); // 선택
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX_DESC = 2000;
  const MAX_IMAGES = 12;

  // 시간 min 계산
  const nowLocal = useMemo(
    () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16),
    []
  );
  const endMin = useMemo(() => (startTime ? startTime : nowLocal), [startTime, nowLocal]);

  // 카테고리 로드
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/categories/roots');
        setLargeCategories(Array.isArray(data) ? data : []);
      } catch {
        setLargeCategories([]);
      }
    })();
  }, []);

  const handleLargeChange = async (categoryId) => {
    setSelectedLarge(categoryId);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    try {
      const { data } = await axios.get(`/api/categories/${categoryId}`);
      setMiddleCategories(Array.isArray(data) ? data : []);
    } catch {
      setMiddleCategories([]);
    }
  };

  const handleMiddleChange = async (categoryId) => {
    setSelectedMiddle(categoryId);
    setSelectedSmall(null);
    try {
      const { data } = await axios.get(`/api/categories/${categoryId}`);
      setSmallCategories(Array.isArray(data) ? data : []);
    } catch {
      setSmallCategories([]);
    }
  };

  const handleSmallChange = (categoryId) => setSelectedSmall(categoryId);

  // 이미지 업로드/삭제
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remain = MAX_IMAGES - imagePreviews.length;
    if (remain <= 0) return;
    const picked = files.slice(0, remain);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...picked]);
    setImagePreviews((prev) => [...prev, ...urls]);
    e.target.value = '';
  };

  const handleRemoveImage = (idx) => {
    setImagePreviews((prev) => {
      const url = prev[idx];
      if (url?.startsWith('blob:')) {
        try { URL.revokeObjectURL(url); } catch { }
      }
      return prev.filter((_, i) => i !== idx);
    });
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => {
        if (typeof u === 'string' && u.startsWith('blob:')) {
          try { URL.revokeObjectURL(u); } catch { }
        }
      });
    };
  }, [imagePreviews]);

  // 임시 저장
  const handleSaveDraft = () => {
    const draft = {
      savedAt: new Date().toISOString(),
      title, startCost, buyoutCost, startTime, endTime, content,
      selectedLarge, selectedMiddle, selectedSmall,
    };
    try {
      localStorage.setItem('auction_draft:new', JSON.stringify(draft));
      alert('임시 저장되었습니다.');
    } catch {
      alert('임시 저장에 실패했습니다.');
    }
  };

  // 검증
  const validate = () => {
    if (!title.trim()) return '제목을 입력해 주세요.';
    if (!selectedSmall) return '카테고리를 선택해 주세요.';
    if (!startCost || Number(startCost) <= 0) return '시작가는 0보다 커야 합니다.';
    if (buyoutCost && Number(buyoutCost) <= Number(startCost)) return '즉시구매가는 시작가보다 커야 합니다.';
    if (!startTime || !endTime) return '시작/종료 시간을 모두 입력해 주세요.';
    const st = new Date(startTime);
    const et = new Date(endTime);
    if (Number.isNaN(st.getTime()) || Number.isNaN(et.getTime())) return '시간 형식을 확인해 주세요.';
    if (st >= et) return '종료 시간은 시작 시간보다 늦어야 합니다.';
    if (!content.trim() || content.trim().length < 10) return '상품 설명은 10자 이상 입력해 주세요.';
    if (content.trim().length > MAX_DESC) return `상품 설명은 최대 ${MAX_DESC}자까지 가능합니다.`;
    return null;
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login?redirect=/register-auction');
      return;
    }

    const v = validate();
    if (v) { alert(v); return; }

    try {
      setSubmitting(true);

      // 1) 본문 저장(엔드포인트는 프로젝트 스펙에 맞게 조정해 주세요)
      const payload = {
        title: title.trim(),
        startCost: Number(startCost),
        buyoutCost: buyoutCost === '' ? null : Number(buyoutCost),
        startTime, // 서버가 ISO/LocalDateTime 문자열을 받는다면 그대로 전달 또는 변환
        endTime,
        content: content.trim(),
        categoryId: selectedSmall,
      };

      const createRes = await axios.post('/api/auction', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const auctionId = createRes?.data?.auctionId ?? createRes?.data?.id;
      if (!auctionId) throw new Error('경매 ID를 확인할 수 없습니다.');

      // 2) 이미지 업로드(선택) — 실제 스펙에 맞게 엔드포인트 확인 필요
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((f) => fd.append('images', f));
        await axios.post(`/api/auction/${auctionId}/images`, fd, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      alert('경매가 등록되었습니다.');
      navigate(`/auction/detail/${auctionId}`);
    } catch (err) {
      console.error('[AUCTION CREATE FAIL]', err);
      const msg = err?.response?.data?.message || err?.message || '등록 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={stylesLayout.auctionRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmit} noValidate>
          <section className={stylesLayout.section}>
            <h1 className={stylesLayout.pageTitle}>경매 등록</h1>

            <ul className={stylesLayout.formGroups}>
              {/* 1) 상품 이미지 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>상품 이미지</div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    {/* 업로드 버튼 */}
                    <li
                      className={`${stylesForm.imageUploadItem} ${stylesForm.addImage} ${imagePreviews.length >= MAX_IMAGES ? stylesForm.disabled : ''
                        }`}
                    >
                      <label htmlFor="auction-image-upload">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>이미지 등록</span>
                      </label>
                      <input
                        id="auction-image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={imagePreviews.length >= MAX_IMAGES}
                        style={{ display: 'none' }}
                      />
                    </li>

                    {/* 미리보기 */}
                    {imagePreviews.map((src, idx) => (
                      <li key={`img-${idx}`} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                        <img src={src} alt={`미리보기 ${idx + 1}`} />
                        <button
                          type="button"
                          className={stylesForm.removeImageButton}
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="이미지 삭제"
                          title="이미지 삭제"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* 2) 카테고리 */}
              <li className={stylesLayout.formGroup}>
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
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${selectedLarge === cat.id ? stylesForm.active : ''}`}
                            >
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
                      {!selectedLarge ? (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 선택</div>
                      ) : middleCategories.length === 0 ? (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 없음</div>
                      ) : (
                        <ul className={stylesForm.categoryList}>
                          {middleCategories.map((cat) => (
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${selectedMiddle === cat.id ? stylesForm.active : ''}`}
                            >
                              <button type="button" onClick={() => handleMiddleChange(cat.id)} aria-selected={selectedMiddle === cat.id}>
                                {cat.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {/* 소분류 */}
                    <div className={stylesForm.categoryColumn}>
                      {!selectedMiddle ? (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 선택</div>
                      ) : smallCategories.length === 0 ? (
                        <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 없음</div>
                      ) : (
                        <ul className={stylesForm.categoryList}>
                          {smallCategories.map((cat) => (
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${selectedSmall === cat.id ? stylesForm.active : ''}`}
                            >
                              <button type="button" onClick={() => handleSmallChange(cat.id)} aria-selected={selectedSmall === cat.id}>
                                {cat.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </li>

              {/* 3) 제목 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>제목</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="경매 제목"
                    maxLength={60}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <div className={stylesForm.charCounter}>{title.length}/60</div>
                </div>
              </li>

              {/* 4) 가격 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>가격</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    {/* 시작가 */}
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="시작가"
                        value={startCost}
                        onChange={(e) => setStartCost(e.target.value)}
                        required
                        min={1}
                        step={1000}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-label="시작가"
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>

                    {/* 즉시구매가(선택) */}
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="즉시구매가(선택)"
                        value={buyoutCost}
                        onChange={(e) => setBuyoutCost(e.target.value)}
                        min={startCost ? String(parseInt(startCost, 10) + 1) : '1'}
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

              {/* 5) 시간 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>시간</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.grid2}>
                    <label className={stylesForm.selectLabel}>
                      <span>시작 시간</span>
                      <input
                        type="datetime-local"
                        className={stylesForm.formInput}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        min={nowLocal}
                        required
                      />
                    </label>
                    <label className={stylesForm.selectLabel}>
                      <span>종료 시간</span>
                      <input
                        type="datetime-local"
                        className={stylesForm.formInput}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={endMin}
                        required
                      />
                    </label>
                  </div>
                </div>
              </li>

              {/* 6) 설명 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="상품 설명을 입력해 주세요. (최소 10자)"
                    rows={8}
                    required
                    minLength={10}
                    maxLength={MAX_DESC}
                    aria-describedby="auction-desc-counter"
                  />
                  <div id="auction-desc-counter" className={stylesForm.charCounter}>
                    {content.length}/{MAX_DESC}
                  </div>
                </div>
              </li>
            </ul>
          </section>

          {/* 하단 푸터 버튼(경매 전용 버튼 CSS 사용) */}
          <footer className={stylesButtons.footer}>
            <button
              type="button"
              className={stylesButtons.btnDraft}
              onClick={handleSaveDraft}
              disabled={submitting}
            >
              임시저장
            </button>
            <button
              type="submit"
              className={stylesButtons.btnSubmit}
              disabled={submitting}
              aria-busy={submitting ? 'true' : 'false'}
            >
              {submitting ? '등록 중…' : '등록하기'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default AuctionRegister;