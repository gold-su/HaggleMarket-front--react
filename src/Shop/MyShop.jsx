import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ShopCSS/MyShopContainer.css';
import '../ShopCSS/MyShopHeader.css';
import '../ShopCSS/MyShopNavigation.css';
import '../ShopCSS/MyShopContent.css';

function MyShop() {
  const navigate = useNavigate();

  const initialProfile = {
    storeName: '상점85150665호',
    profileImage: 'https://via.placeholder.com/120?text=Store',
    isVerified: true,
    storeOpenDate: '1일 전',
    storeVisits: 0,
    salesCount: 0,
    description: '앱에서 가게 소개 작성하고 신뢰도를 높여 보세요.',
  };

  const [profile, setProfile] = useState(initialProfile);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('상품');

  const handleProfileImageChangeClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const goToProductManagement = () => {
    console.log("내 상점 관리 버튼 클릭됨!"); // ✅ 디버깅용 로그
    navigate('/myshop/products'); // ProductManagementPage가 연결된 경로
  };

  const goToMyPage = () => {
    navigate('/mypage');
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <section className="myshop-container">
      <div className="myshop-store-header">
        <div className="myshop-profile-image-wrapper">
          <img
            src={profile.profileImage}
            alt="상점 프로필"
            className="myshop-profile-image"
          />
          {/* ✅ 오버레이 div와 카메라 아이콘 추가 */}
          <div className="myshop-profile-image-overlay" onClick={handleProfileImageChangeClick}>
            <svg
              className="myshop-camera-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="myshop-buttons">
            <button
              className="myshop-manage-store-btn" onClick={goToProductManagement}
            >
              내 상점 관리
            </button>
            <button className="myshop-mypage-btn" onClick={goToMyPage}>
              마이페이지
            </button>
          </div>
        </div>
        <div className="myshop-store-details">
          <h1 className="myshop-store-name">
            {profile.storeName}
            {profile.isVerified && (
              <span className="myshop-verified-badge">본인인증 완료</span>
            )}
          </h1>
          <div className="myshop-store-stats">
            <span>상점오픈일 {profile.storeOpenDate}</span>
            <span>상점방문수 {profile.storeVisits}명</span>
            <span>상품판매 {profile.salesCount}회</span>
          </div>
          <p className="myshop-store-description">{profile.description}</p>
        </div>
      </div>

      <nav className="myshop-nav">
        <ul>
          <li
            className={activeTab === '상품' ? 'active' : ''}
            onClick={() => handleTabClick('상품')}
          >
            상품 0
          </li>
          <li
            className={activeTab === '상점후기' ? 'active' : ''}
            onClick={() => handleTabClick('상점후기')}
          >
            상점후기 0
          </li>
          <li
            className={activeTab === '찜' ? 'active' : ''}
            onClick={() => handleTabClick('찜')}
          >
            찜 0
          </li>
          <li
            className={activeTab === '팔로잉' ? 'active' : ''}
            onClick={() => handleTabClick('팔로잉')}
          >
            팔로잉 0
          </li>
          <li
            className={activeTab === '팔로워' ? 'active' : ''}
            onClick={() => handleTabClick('팔로워')}
          >
            팔로워 0
          </li>
        </ul>
      </nav>

      <div className="myshop-content">
        {activeTab === '상품' && <p>등록된 상품이 없습니다.</p>}
        {activeTab === '상점후기' && <p>상점 후기 내용이 여기에 표시됩니다.</p>}
        {activeTab === '찜' && <p>찜한 상품 목록이 여기에 표시됩니다.</p>}
        {activeTab === '팔로잉' && <p>팔로잉 목록이 여기에 표시됩니다.</p>}
        {activeTab === '팔로워' && <p>팔로워 목록이 여기에 표시됩니다.</p>}
      </div>
    </section>
  );
}

export default MyShop;