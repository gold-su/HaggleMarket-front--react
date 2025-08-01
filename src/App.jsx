import axios from 'axios';
import React, { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import logo from "./logo.svg";
import Header from './components/Header';
import MenuBox from './MainPages/MenuBox';
import TopBar from "./components/TopBar";
import ProductList from './MainPages/ProductList';
<<<<<<< HEAD
import AuctionAdSection from './MainPages/AuctionAdSection';
=======
import MyShop from './Shop/MyShop'; // 내 상점 컴포넌트 임포트
import AuctionAdSection from './MainPages/AuctionAdSection';
// import MyPage from './Shop/MyPage'; // 마이페이지 컴포넌트 임포트
import EditProfile from './editPage/EditProfile'; // 프로필 수정 컴포넌트 임포트
>>>>>>> origin/Gwang-Pyo
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LikeBox from "./components/LikeBox";
import Product from './oldMVP/ProductRegister';
import "./App.css";
<<<<<<< HEAD
import WithdrawUser from './oldMVP/WithdrawPage';
import ProductDetail from "./oldMVP/ProductDetail";
import MyShop from "./Shop/MyShop";
import MyPage from './Shop/MyPage';
import ProductRegister from './Product/ProductRegister';

import "./App.css";
import TopBar from "./MainPages/TopBar";
=======
import ProductDetail from './Product/ProductDetail';
import ProductEdit from './oldMVP/ProductEdit';
import ProductForm from './Product/ProductForm';
>>>>>>> origin/Gwang-Pyo


function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴는 기본적으로 닫혀있어야 합니다.
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);

  const [likeCount, setLikeCount] = useState(5); // 예시로 5개 찜했다고 가정

  useEffect(() => {
    // 인기 키워드는 그대로 사용
    setFrequentKeywords([
      '재테크', '맛집', '카페', '소프트웨어 개발', '프로그래밍', '데이터 관리', 'IT 기술',
      '여행', '건강', '영화', '음악', '독서', '운동', '요리'
    ]);

    // 게시물 목록 API 호출
    axios
      .get('http://localhost:8080/api/products?page=0&size=8&sort=createdAt,desc')
      .then((res) => {
        const items = res.data.content.map((post) => {
          const productStatusMap = {
            LIKE_NEW: "새 상품",
            USED_GOOD: "사용감 적음",
            USED: "사용감 많음",
            DAMAGED: "고장/파손"
          };

          return {
            id: post.postId,
            title: post.title,
            description: productStatusMap[post.productStatus] || "기타",
            price: post.cost.toLocaleString() + '원',
            imageUrl: post.thumbnail,
            detailUrl: `/detail/${post.postId}`
          };
        });
        setProducts(items);
      })
      .catch((err) => console.error('게시물 로딩 실패', err));
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
<<<<<<< HEAD
                <ProductList products={products} />
=======
                <ProductList
                  products={products}
                  selectedCategory={"used"}
                  onCategoryChange={(value) => console.log("선택된 카테고리:", value)}
                />
>>>>>>> origin/Gwang-Pyo
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
<<<<<<< HEAD
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

=======

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
          path="/products/detail/:id"
          element={
            <>
              <TopBar />
              <Header
                onMenuToggle={handleMenuToggle}
                onSearch={handleSearch}
                frequentKeywords={frequentKeywords}
              />
              <ProductDetail />
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
              <ProductForm mode="create" />
              <MenuBox
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                frequentKeywords={frequentKeywords}
              />
            </>
          }
        />

        <Route
          path="/products/edit/:id"
          element={
            <>
              <TopBar />
              <Header
                onMenuToggle={handleMenuToggle}
                onSearch={handleSearch}
                frequentKeywords={frequentKeywords}
              />
              <ProductForm mode="edit" />
              <MenuBox
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                frequentKeywords={frequentKeywords}
              />
            </>
          }
        />
>>>>>>> origin/Gwang-Pyo
      </Routes>
    </BrowserRouter>

  );
}

export default App;