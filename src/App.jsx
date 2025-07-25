import React, { useState, useEffect } from "react";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login";
import logo from "./logo.svg";
import Header from './components/Header';
import MenuBox from './MainPages/MenuBox';
import TopBar from "./components/TopBar";
import ProductList from './MainPages/ProductList';
import AuctionRegister from './Auction/AuctionRegister'; // ✅ 새로 생성한 경매 상품 등록 컴포넌트 임포트
import MyShop from './Shop/MyShop'; // 내 상점 컴포넌트 임포트
import ProductManagementPage from './Shop/ProductManagementPage';
import AuctionAdSection from './MainPages/AuctionAdSection'; 
import MyPage from './Shop/MyPage'; // 마이페이지 컴포넌트 임포트
import EditProfile from './editPage/EditProfile'; // 프로필 수정 컴포넌트 임포트
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LikeBox from "./components/LikeBox";
import Product from './Product/ProductRegister';
import "./App.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴는 기본적으로 닫혀있어야 합니다.
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);

  const [likeCount, setLikeCount] = useState(5); // 예시로 5개 찜했다고 가정

  useEffect(() => {
    setFrequentKeywords([
      '재테크', '맛집', '카페', '소프트웨어 개발', '프로그래밍', '데이터 관리', 'IT 기술',
      '여행', '건강', '영화', '음악', '독서', '운동', '요리'
    ]);
    setProducts([
      {
        id: 1,
        title: '아이폰 12 중고',
        description: '상태 아주 좋음, 케이스 포함',
        price: '350,000원',
        imageUrl: 'https://images.unsplash.com/photo-1603898037225-3e1a3b7a5d9f?auto=format&fit=crop&w=400&q=80',
        detailUrl: 'detail/iphone12.html'
      },
      {
        id: 2,
        title: '삼성 갤럭시 버즈',
        description: '사용감 약간 있음, 충전기 포함',
        price: '50,000원',
        imageUrl: 'https://images.unsplash.com/photo-1580910051070-1f6a4b1a8e7b?auto=format&fit=crop&w=400&q=80',
        detailUrl: 'detail/galaxybuds.html'
      },
      {
        id: 3,
        title: '중고 노트북 Dell XPS',
        description: 'i7, 16GB RAM, SSD 512GB',
        price: '850,000원',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
        detailUrl: 'detail/dellxps.html'
      },
      {
        id: 4,
        title: '캠핑용 텐트',
        description: '4인용, 상태 양호',
        price: '120,000원',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        detailUrl: 'detail/campingtent.html'
      },
      {
        id: 5,
        title: '중고 자전거',
        description: '알루미늄 프레임, 변속기 포함',
        price: '180,000원',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
        detailUrl: 'detail/bike.html'
      }
    ]);
  }, []);

  //특정 단어로 검색
  const handleSearch = (query) => {
    if (query) {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    }
  };

  //버튼 클릭 시 메뉴 박스 여닫기
  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      const menuBoxElement = document.getElementById('menuBox');
      const menuToggleElement = document.getElementById('menuToggle');

      if (menuBoxElement && menuToggleElement && !menuBoxElement.contains(e.target) && !menuToggleElement.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    // 메뉴 박스 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', handleClickOutsideMenu);
    return () => {
      document.removeEventListener('click', handleClickOutsideMenu);
    };
  }, []);

  return (
    <BrowserRouter>
    <Routes>
    {/* 로그인 & 회원가입 (TopBar/Header 제외) */}
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/editprofile" element={<EditProfile />} />
    {/* <Route path="/mypage" element={<MyPage />} /> */}
    {/* 나머지 페이지 (TopBar/Header 포함) */}
    <Route
      path="/"
      element={
        <>
          <TopBar />
          <Header
            onMenuToggle={handleMenuToggle}
            onSearch={handleSearch}
            frequentKeywords={frequentKeywords}
          />
          <AuctionAdSection />
          <main>
            <ProductList products={products} />
          </main>

          <LikeBox likeCount={likeCount} />

          <MenuBox
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            frequentKeywords={frequentKeywords}
          />
        </>
      }
    />
    <Route
      path="/myshop"
      element={
        <>
          <TopBar />
          <Header
            onMenuToggle={handleMenuToggle}
            onSearch={handleSearch}
            frequentKeywords={frequentKeywords}
          />
          <MyShop />
          <MenuBox
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            frequentKeywords={frequentKeywords}
          />
        </>
      }
    />

    <Route
      path="/mypage"
      element={
        <>
          <TopBar />
          <Header
            onMenuToggle={handleMenuToggle}
            onSearch={handleSearch}
            frequentKeywords={frequentKeywords}
          />
          <MyPage />
          <MenuBox
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            frequentKeywords={frequentKeywords}
          />
        </>
      }
    />

    <Route
      path="/product"
      element={
        <>
          <TopBar />
          <Header
            onMenuToggle={handleMenuToggle}
            onSearch={handleSearch}
            frequentKeywords={frequentKeywords}
          />
          <Product />
          <MenuBox
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            frequentKeywords={frequentKeywords}
          />
        </>
      }
    />
    
    <Route
          path="/myshop/products" 
          element={
            <>
              <TopBar /> {/* ✅ 기존 TopBar */}
              <Header
                onMenuToggle={handleMenuToggle}
                onSearch={handleSearch}
                frequentKeywords={frequentKeywords}
              /> {/* ✅ 기존 Header */}
              <ProductManagementPage /> {/* ✅ 새로운 상품 관리 컴포넌트 렌더링 */}
              <MenuBox
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                frequentKeywords={frequentKeywords}
              /> {/* ✅ 기존 MenuBox */}
            </>
          }
        />

        {/* ✅ 경매 상품 등록 페이지 라우트 추가 */}
        <Route
          path="/register-auction" // ✅ 이 경로로 접근합니다.
          element={
            <>
              {/* TopBar와 Header를 포함할지 여부는 페이지 디자인에 따라 결정 */}
              <TopBar />
              <Header
                onMenuToggle={handleMenuToggle}
                onSearch={handleSearch}
                frequentKeywords={frequentKeywords}
              />
              <AuctionRegister /> {/* ✅ 새로운 경매 상품 등록 컴포넌트 렌더링 */}
              <MenuBox
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                frequentKeywords={frequentKeywords}
              />
            </>
          }
        />
        
  </Routes>
</BrowserRouter>

  );
}

export default App;