// src/Auction/AuctionRegister.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

// ⬇️ 판매하기 페이지와 동일한 스타일 모듈을 재사용
import stylesLayout from "../ProductCSS/ProductFormLayout.module.css";
import stylesForm from "../ProductCSS/ProductFormInputs.module.css";
import stylesButtons from "../ProductCSS/ProductFormButtons.module.css";

function AuctionRegister() {
  // ----- 기본 필드 (필요 시 기존 상태/핸들러로 교체) -----
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  const [title, setTitle] = useState("");
  const [startCost, setStartCost] = useState("");
  const [buyoutCost, setBuyoutCost] = useState("");
  const [bidUnit, setBidUnit] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("별도");
  const [desc, setDesc] = useState("");
  const [tradeLocation, setTradeLocation] = useState("");
  const [contact, setContact] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ----- 카테고리 로딩 (판매하기 페이지와 동일 패턴) -----
  useEffect(() => {
    axios
      .get("/api/categories/roots")
      .then((res) => setLargeCategories(res.data || []))
      .catch(() => setLargeCategories([]));
  }, []);

  const onLarge = (id) => {
    setSelectedLarge(id);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    axios
      .get(`/api/categories/${id}`)
      .then((res) => setMiddleCategories(res.data || []))
      .catch(() => setMiddleCategories([]));
  };
  const onMiddle = (id) => {
    setSelectedMiddle(id);
    setSelectedSmall(null);
    axios
      .get(`/api/categories/${id}`)
      .then((res) => setSmallCategories(res.data || []))
      .catch(() => setSmallCategories([]));
  };

  // ----- 이미지 업로드(미리보기만) -----
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remain = Math.max(0, 12 - (images.length + imagePreviews.length));
    const picked = files.slice(0, remain);
    const urls = picked.map((f) => URL.createObjectURL(f));
    setImages((p) => [...p, ...picked]);
    setImagePreviews((p) => [...p, ...urls]);
  };
  const removePreview = (idx) => {
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
    setImages((p) => p.filter((_, i) => i !== idx));
  };

  // ----- 제출 (기존 API와 맞추어 사용하세요) -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim()) return alert("경매 상품명을 입력해 주세요.");
    if (!selectedSmall) return alert("카테고리를 선택해 주세요.");
    if (!(Number(startCost) > 0)) return alert("시작가는 0보다 큰 숫자여야 합니다.");
    if (!startTime || !endTime) return alert("경매 시작/종료 시간을 입력해 주세요.");

    try {
      setSubmitting(true);

      // 1) 이미지 업로드 (필요 시 실제 API로 교체)
      let uploaded = [];
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach((f) => fd.append("images", f));
        const res = await axios.post("/api/auction/images", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded = res.data || [];
      }

      // 2) 본문 업로드 (필요 시 실제 API로 교체)
      const dto = {
        title: title.trim(),
        startCost: Number(startCost),
        buyoutCost: buyoutCost ? Number(buyoutCost) : null,
        bidUnit: bidUnit ? Number(bidUnit) : null,
        deliveryFee: deliveryFee === "포함",
        content: desc.trim(),
        categoryId: selectedSmall,
        tradeLocation,
        contact,
        startTime,
        endTime,
        imageUrls: uploaded,
      };

      await axios.post("/api/auction", dto, {
        headers: { "Content-Type": "application/json" },
      });

      alert("경매가 등록되었습니다.");
      window.history.back();
    } catch (err) {
      console.error(err);
      alert("등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmit} noValidate>
          <section className={stylesLayout.registerSection}>
            <h1 className={stylesLayout.registerTitle}>경매 상품 등록</h1>

            <ul className={stylesLayout.formGroups}>
              {/* 이미지 업로드 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품 이미지</div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    <li
                      className={`${stylesForm.imageUploadItem} ${stylesForm.addImage} ${
                        imagePreviews.length >= 12 ? stylesForm.disabled : ""
                      }`}
                    >
                      <label htmlFor="auction-image-input">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>이미지 등록</span>
                      </label>
                      <input
                        id="auction-image-input"
                        type="file"
                        accept="image/jpg, image/jpeg, image/png"
                        multiple
                        onChange={handleImageChange}
                        disabled={imagePreviews.length >= 12}
                        style={{ display: "none" }}
                      />
                    </li>

                    {imagePreviews.map((src, idx) => (
                      <li
                        key={idx}
                        className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}
                      >
                        <img src={src} alt={`업로드 미리보기 ${idx + 1}`} />
                        <button
                          type="button"
                          className={stylesForm.removeImageButton}
                          onClick={() => removePreview(idx)}
                          aria-label="이미지 삭제"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* 상품명 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품 명</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="경매 상품명을 입력해 주세요."
                    maxLength={50}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <div className={stylesForm.charCounter}>
                    {title.length}/50
                  </div>
                </div>
              </li>

              {/* 카테고리 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>카테고리</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.categorySelectionArea}>
                    {/* 대분류 */}
                    <div className={stylesForm.categoryColumn}>
                      <ul className={stylesForm.categoryList}>
                        {largeCategories.length === 0 ? (
                          <li
                            className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                          >
                            카테고리 불러오는 중...
                          </li>
                        ) : (
                          largeCategories.map((cat) => (
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${
                                selectedLarge === cat.id
                                  ? stylesForm.active
                                  : ""
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => onLarge(cat.id)}
                                aria-selected={selectedLarge === cat.id}
                              >
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
                        <div
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          중분류 선택
                        </div>
                      ) : middleCategories.length === 0 ? (
                        <div
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          중분류 없음
                        </div>
                      ) : (
                        <ul className={stylesForm.categoryList}>
                          {middleCategories.map((cat) => (
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${
                                selectedMiddle === cat.id
                                  ? stylesForm.active
                                  : ""
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => onMiddle(cat.id)}
                                aria-selected={selectedMiddle === cat.id}
                              >
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
                        <div
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          소분류 선택
                        </div>
                      ) : smallCategories.length === 0 ? (
                        <div
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          소분류 없음
                        </div>
                      ) : (
                        <ul className={stylesForm.categoryList}>
                          {smallCategories.map((cat) => (
                            <li
                              key={cat.id}
                              className={`${stylesForm.categoryItem} ${
                                selectedSmall === cat.id
                                  ? stylesForm.active
                                  : ""
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedSmall(cat.id)}
                                aria-selected={selectedSmall === cat.id}
                              >
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

              {/* 경매 정보 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>경매 정보</h2>
              </li>

              {/* 시작가 / 즉구가 / 최소입찰단위 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>가격</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow} style={{ flexWrap: "wrap" }}>
                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="시작가"
                        value={startCost}
                        onChange={(e) => setStartCost(e.target.value)}
                        min={1}
                        step={1}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>

                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="즉시구매가 (선택)"
                        value={buyoutCost}
                        onChange={(e) => setBuyoutCost(e.target.value)}
                        min={0}
                        step={1}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>

                    <div className={stylesForm.priceInputWrapper}>
                      <input
                        type="number"
                        className={stylesForm.priceInput}
                        placeholder="최소 입찰 단위 (선택)"
                        value={bidUnit}
                        onChange={(e) => setBidUnit(e.target.value)}
                        min={0}
                        step={1}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      <span className={stylesForm.currency}>원</span>
                    </div>
                  </div>
                </div>
              </li>

              {/* 경매 기간 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>경매 기간</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <input
                      type="datetime-local"
                      className={stylesForm.formInput}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      aria-label="경매 시작 시간"
                      style={{ maxWidth: 280 }}
                    />
                    <input
                      type="datetime-local"
                      className={stylesForm.formInput}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      aria-label="경매 종료 시간"
                      style={{ maxWidth: 280 }}
                    />
                  </div>
                </div>
              </li>

              {/* 설명 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품 설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    rows={8}
                    placeholder="경매 상품 설명을 입력해 주세요. (최소 10자)"
                    minLength={10}
                    maxLength={2000}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <div className={stylesForm.charCounter}>
                    {desc.length}/2000
                  </div>
                </div>
              </li>

              {/* 배송비 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>배송비</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.radioGroup}>
                    {["포함", "별도"].map((fee) => (
                      <label key={fee} className={stylesForm.radioLabel}>
                        <input
                          type="radio"
                          name="auctionDeliveryFee"
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

              {/* 추가정보 */}
              <li className={stylesLayout.formGroupTitle}>
                <h2 className={stylesLayout.registerTitle}>추가정보</h2>
              </li>

              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
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

              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
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
                <button type="button" className={stylesButtons.btnDraft}>
                  임시저장
                </button>
                <button
                  type="submit"
                  className={stylesButtons.btnSubmit}
                  disabled={submitting}
                >
                  {submitting ? "등록 중…" : "등록하기"}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default AuctionRegister;
