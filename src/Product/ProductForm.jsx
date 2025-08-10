import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../ProductCSS/ProductRegisterLayout.css';
import '../ProductCSS/ProductRegisterForm.css';
import '../ProductCSS/ProductRegisterButtons.css';

function ProductForm({ mode = 'create' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  // 카테고리 상태
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);

  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  // 공통 상태
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

  // 대분류 목록 로딩 (공통)
  useEffect(() => {
    axios.get("/api/categories/roots")
      .then(res => setLargeCategories(res.data))
      .catch(err => console.error("카테고리 로딩 실패", err));
  }, []);

  // 카테고리 선택 핸들러
  const handleLargeChange = (id) => {
    setSelectedLarge(id);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    axios.get(`/api/categories/${id}`).then(res => setMiddleCategories(res.data));
  };

  const handleMiddleChange = (id) => {
    setSelectedMiddle(id);
    setSelectedSmall(null);
    axios.get(`/api/categories/${id}`).then(res => setSmallCategories(res.data));
  };

  const handleSmallChange = (id) => {
    setSelectedSmall(id);
  };

  // 수정 모드 데이터 로딩
  useEffect(() => {
    if (mode === 'edit' && id) {
      axios.get(`/api/products/detail/${id}`)
        .then(async (res) => {
          const data = res.data;
          setProductName(data.title);
          setPrice(data.cost);
          setDescription(data.content);
          setProductStatus(data.productStatus);
          setNegotiable(data.negotiable);
          setExchangeable(data.swapping);
          setDeliveryFee(data.deliveryFee ? '포함' : '별도');
          setTags(data.tag || '');
          setTradeLocation(data.seller?.address || '');
          setExistingImageUrls(data.images);
          setImagePreviews(data.images.map(url => `http://localhost:8080${url}`));

          // categoryId 기반 자동 세팅
          if (data.categoryId) {
            try {
              // 1. 소분류
              const smallRes = await axios.get(`/api/categories/detail/${data.categoryId}`);
              const small = smallRes.data;
              const middleId = small.parent.id;

              // 2. 중분류
              const middleRes = await axios.get(`/api/categories/detail/${middleId}`);
              const middle = middleRes.data;
              const largeId = middle.parent.id;

              // 대분류 목록
              const largeList = await axios.get(`/api/categories/roots`);
              setLargeCategories(largeList.data);
              setSelectedLarge(largeId);

              // 중분류 목록
              const middleList = await axios.get(`/api/categories/${largeId}`);
              setMiddleCategories(middleList.data);
              setSelectedMiddle(middleId);

              // 소분류 목록
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
    setImages(prev => [...prev, ...files].slice(0, 12));
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
      // 이미지 업로드
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
        cost: parseInt(price),
        content: description,
        negotiable,
        swapping: exchangeable,
        deliveryFee: deliveryFee === "포함",
        productStatus,
        imageUrls: finalImageUrls,
        categoryId: selectedSmall,
        tag: tags,
        tradeLocation
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
        alert("등록 완료!");
        navigate(`/products/detail/${res.data.id}`);
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

  return (
    <div className="product-register-page">
      <main className="register-main-content">
        <section className="register-section">
          <h1 className="register-title">
            {mode === 'edit' ? '상품 수정' : '상품 등록'}
          </h1>
          <ul className="form-groups">

            {/* 이미지 업로드 */}
            <li className="form-group">
              <div className="form-label">상품이미지</div>
              <div className="form-content">
                <ul className="image-upload-list">
                  <li className="image-upload-item add-image">
                    <label htmlFor="image-upload-input">
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
                  {imagePreviews.map((url, i) => (
                    <li key={i} className="image-upload-item image-preview-item">
                      <img src={url} alt={`미리보기 ${i + 1}`} />
                      <button type="button" className="remove-image-button" onClick={() => handleRemoveImage(i)}>X</button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            {/* 상품명 */}
            <li className="form-group">
              <div className="form-label">상품명</div>
              <input className="form-input" value={productName} onChange={e => setProductName(e.target.value)} />
            </li>

            {/* 카테고리 */}
            <li className="form-group">
              <div className="form-label">카테고리</div>
              <div className="form-content category-selection-area">

                {/* 대분류 */}
                <div className="category-column">
                  <ul>
                    {largeCategories.map(cat => (
                      <li key={cat.id}>
                        <button type="button"
                          onClick={() => handleLargeChange(cat.id)}>
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 중분류 */}
                <div className="category-column">
                  {selectedLarge && (
                    <ul>
                      {middleCategories.map(cat => (
                        <li key={cat.id}>
                          <button type="button"
                            onClick={() => handleMiddleChange(cat.id)}>
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 소분류 */}
                <div className="category-column">
                  {selectedMiddle && (
                    <ul>
                      {smallCategories.map(cat => (
                        <li key={cat.id}>
                          <button type="button"
                            onClick={() => handleSmallChange(cat.id)}>
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </li>

            {/* 상품 상태 */}
            <li className="form-group">
              <div className="form-label">상품 상태</div>
              <div className="form-content">
                <div className="radio-group">
                  {[
                    { label: "새 상품 (미사용)", value: "NEW" },
                    { label: "사용감 거의 없음", value: "USED_LIKE_NEW" },
                    { label: "사용감 있음", value: "USED" },
                    { label: "고장/파손 상품", value: "DAMAGED" }
                  ].map((item) => (
                    <label key={item.value} className="radio-label">
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
                  {['포함', '별도'].map((fee) => (
                    <label key={fee} className="radio-label">
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
        <div className="inner">
          <button className="btn-submit" onClick={handleSubmit}>
            {mode === 'edit' ? '수정하기' : '등록하기'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default ProductForm;