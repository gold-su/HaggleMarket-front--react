import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import stylesLayout from '../ProductCSS/ProductFormLayout.module.css'; // 파일명 변경 반영
import stylesForm from '../ProductCSS/ProductFormInputs.module.css';     // 파일명 변경 반영
import stylesButtons from '../ProductCSS/ProductFormButtons.module.css'; // 파일명 변경 반영

function ProductForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);

  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);

  const [productName, setProductName] = useState('');
  const [productStatus, setProductStatus] = useState('LIKE_NEW');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [exchangeable, setExchangeable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('별도');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [tradeLocation, setTradeLocation] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    axios.get("/api/categories/roots")
      .then(res => setLargeCategories(res.data))
      .catch(err => console.error("카테고리 로딩 실패", err));
  }, []);

  const handleLargeChange = (categoryId) => {
    setSelectedLarge(categoryId);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    axios.get(`/api/categories/${categoryId}`)
      .then(res => setMiddleCategories(res.data))
      .catch(() => setMiddleCategories([]));
  };

  const handleMiddleChange = (categoryId) => {
    setSelectedMiddle(categoryId);
    setSelectedSmall(null);
    axios.get(`/api/categories/${categoryId}`)
      .then(res => setSmallCategories(res.data))
      .catch(() => setSmallCategories([]));
  };

  const handleSmallChange = (categoryId) => {
    setSelectedSmall(categoryId);
  };

  useEffect(() => {
    if (mode === 'edit' && id) {
      axios.get(`/api/products/detail/${id}`)
        .then(async (res) => {
          const data = res.data;
          setProductName(data.title || '');
          setPrice(data.cost ?? '');
          setDescription(data.content || '');
          setProductStatus(data.productStatus || 'LIKE_NEW');
          setNegotiable(!!data.negotiable);
          setExchangeable(!!data.swapping);
          setDeliveryFee(data.deliveryFee ? '포함' : '별도');
          setTags(data.tag || '');
          setTradeLocation(data.seller?.address || '');
          const imgs = Array.isArray(data.images) ? data.images : [];
          setExistingImageUrls(imgs);
          setImagePreviews(imgs.map(url => `http://localhost:8080${url}`));

          if (data.categoryId) {
            try {
              const smallRes = await axios.get(`/api/categories/detail/${data.categoryId}`);
              const small = smallRes.data;
              const middleId = small.parent.id;

              const middleRes = await axios.get(`/api/categories/detail/${middleId}`);
              const middle = middleRes.data;
              const largeId = middle.parent.id;

              const largeList = await axios.get(`/api/categories/roots`);
              setLargeCategories(largeList.data);
              setSelectedLarge(largeId);

              const middleList = await axios.get(`/api/categories/${largeId}`);
              setMiddleCategories(middleList.data);
              setSelectedMiddle(middleId);

              const smallList = await axios.get(`/api/categories/${middleId}`);
              setSmallCategories(smallList.data);
              setSelectedSmall(data.categoryId);
            } catch (err) {
              console.error("카테고리 자동 세팅 실패", err);
            }
          }
        })
        .catch(err => console.error("게시글 로딩 실패", err));
    }
  }, [mode, id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const nextImages = [...images, ...files].slice(0, 12);
    setImages(nextImages);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 12));
  };

  const handleRemoveImage = (index) => {
    if (mode === 'edit' && index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImageUrls.length;
      setImages(prev => prev.filter((_, i) => i !== newIndex));
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return alert("제목을 입력해주세요.");
    if (description.trim().length < 10) return alert("상품 설명은 10자 이상 입력해주세요.");
    try {
      let uploadedImageUrls = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(f => formData.append("images", f));
        const res = await axios.post("/api/products/images", formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        });
        uploadedImageUrls = res.data;
      }

      const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      const dto = {
        title: productName,
        cost: parseInt(price || 0, 10),
        content: description,
        negotiable,
        swapping: exchangeable,
        deliveryFee: deliveryFee === "포함",
        productStatus,
        imageUrls: finalImageUrls,
        categoryId: selectedSmall,
        tag: tags,
        tradeLocation,
        contact
      };

      if (mode === 'edit') {
        await axios.put(`/api/products/${id}`, dto, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        alert("수정 완료!");
        navigate(`/products/detail/${id}`);
      } else {
        const res = await axios.post("/api/products", dto, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const newId = res.data.postId ?? res.data.id;
        alert("등록 완료!");
        navigate(`/products/detail/${newId}`);
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent}>
        <section className={stylesLayout.registerSection}>
          <h1 className={stylesLayout.registerTitle}>{mode === 'edit' ? '상품 수정' : '상품 등록'}</h1>
          <ul className={stylesLayout.formGroups}>
            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품이미지 <small>({imagePreviews.length}/12)</small></div>
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
                  {images.map((imageSrc, index) => ( // ✅ imagePreviews 대신 images 사용
                    <li key={index} className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}>
                      <img src={imageSrc} alt={`미리보기 ${index + 1}`} />
                      <button type="button" className={stylesForm.removeImageButton} onClick={() => handleRemoveImage(index)}>X</button>
                    </li>
                  ))}
                </ul>
                <div className={stylesForm.formHint}>상품 이미지는 PC에서는 1:1, 모바일에서는 1:1.23 비율로 보여져요.</div>
              </div>
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품명</div>
              <div className={stylesLayout.formContent}>
                <div className={stylesForm.productNameInputWrapper}>
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
                <div className={stylesForm.charCounter}>{productName.length}/40</div>
              </div>
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>카테고리</div>
              <div className={`${stylesLayout.formContent} ${stylesForm.categorySelectionArea}`}>
                {/* 대분류 컬럼 */}
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
                          <button
                            type="button"
                            className={stylesForm.categoryButton}
                            onClick={() => handleLargeChange(cat.id)}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* 중분류 컬럼 */}
                <div className={stylesForm.categoryColumn}>
                  {selectedLarge ? (
                    middleCategories.length === 0 ? (
                      <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>중분류 없음</div>
                    ) : (
                      <ul className={stylesForm.categoryList}>
                        {middleCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className={`${stylesForm.categoryItem} ${selectedMiddle === cat.id ? stylesForm.active : ''}`}
                          >
                            <button
                              type="button"
                              className={stylesForm.categoryButton}
                              onClick={() => handleMiddleChange(cat.id)}
                            >
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

                {/* 소분류 컬럼 */}
                <div className={stylesForm.categoryColumn}>
                  {selectedMiddle ? (
                    smallCategories.length === 0 ? (
                      <div className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}>소분류 없음</div>
                    ) : (
                      <ul className={stylesForm.categoryList}>
                        {smallCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className={`${stylesForm.categoryItem} ${selectedSmall === cat.id ? stylesForm.active : ''}`}
                          >
                            <button
                              type="button"
                              className={stylesForm.categoryButton}
                              onClick={() => handleSmallChange(cat.id)}
                            >
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
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품 상태</div>
              <div className={stylesLayout.formContent}>
                <div className={stylesForm.radioGroup}>
                  {[
                    { label: "새 상품 (미사용)", value: "LIKE_NEW" },
                    { label: "사용감 없음", value: "USED_GOOD" },
                    { label: "사용감 적음", value: "USED" },
                    { label: "고장/파손 상품", value: "DAMAGED" }
                  ].map(item => (
                    <label key={item.value} className={stylesForm.radioLabel}>
                      <input
                        type="radio"
                        name="productStatus"
                        value={item.value}
                        checked={productStatus === item.value}
                        onChange={() => setProductStatus(item.value)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </li>

            <li className={`${stylesLayout.formGroup} ${stylesForm.priceGroup}`}> {/* ✅ stylesForm.priceGroup 추가 */}
              <div className={stylesLayout.formLabel}>가격</div>
              <div className={stylesLayout.formContent}>
                <div className={stylesForm.priceInputWrapper}>
                  <input
                    type="number"
                    className="form-input price-input"
                    placeholder="가격을 입력해 주세요."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                  />
                  <span className={stylesForm.currency}>원</span>
                </div>
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

            <li className={`${stylesLayout.formGroup} ${stylesForm.toggleGroup}`}> {/* ✅ stylesForm.toggleGroup 추가 */}
              <div className={stylesLayout.formLabel}>교환</div>
              <div className={stylesLayout.formContent}>
                <label className={stylesForm.toggleLabel}>
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

            <li className={stylesLayout.formGroup}>
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
                      {fee}
                    </label>
                  ))}
                </div>
              </div>
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>상품 설명</div>
              <div className={stylesLayout.formContent}>
                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="상품 설명을 입력해주세요. (10자 이상)"
                  rows={8}
                  required
                  minLength={10}
                />
                <div className={stylesForm.charCounter}>{description.length}/2000</div>
              </div>
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>태그 (선택)</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="text"
                  className={stylesForm.formInput}
                  value={tags} // ✅ tags 상태가 있다고 가정
                  onChange={(e) => setTags(e.target.value)} // ✅ setTags 상태 업데이트 함수 있다고 가정
                  placeholder="쉼표로 구분해 입력"
                />
              </div>
            </li>

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>연락처 (선택)</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="text"
                  className="form-input"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="쉼표로 구분해 입력"
                />
              </div>
            </li>

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

            <li className={stylesLayout.formGroup}>
              <div className={stylesLayout.formLabel}>거래지역 (선택)</div>
              <div className={stylesLayout.formContent}>
                <input
                  type="text"
                  className="form-input"
                  value={tradeLocation}
                  onChange={(e) => setTradeLocation(e.target.value)}
                  placeholder="거래지역 입력"
                />
              </div>
            </li>
          </ul>
        </section>
      </main>

      <footer className={stylesLayout.registerFooter}>
        <div className={stylesLayout.inner}>
          {/* ✅ 버튼 그룹은 ProductRegisterButtons.module.css에 btnGroup이므로 div로 묶고 className 적용 */}
          <div className={stylesButtons.btnGroup}>
            {/* 임시저장 버튼이 필요하다면 아래 주석 해제 */}
            {/* <button className={stylesButtons.btnDraft} onClick={handleSaveDraft}>임시저장</button> */}
            <button className={stylesButtons.btnSubmit} onClick={handleSubmit}>
              {mode === 'edit' ? '수정하기' : '등록하기'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ProductForm;