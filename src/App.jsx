// src/App.jsx
import axios from 'axios';
import React, { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from './components/Header';
import MenuBox from './MainPages/MenuBox';
import TopBar from "./components/TopBar";
import ProductList from './MainPages/ProductList';
import AuctionAdSection from './MainPages/AuctionAdSection';
import AuctionRegister from './Auction/AuctionRegister';
import AuctionEdit from './Auction/AuctionEdit';
import AuctionDetail from './Auction/AuctionDetail';
import MyShop from './Shop/MyShop';
import ProductManagementPage from './Shop/ProductManagementPage';
import MyPage from './Shop/MyPage';
import EditProfile from './editPage/EditProfile';
import ProductDetail from './Product/ProductDetail';
import ProductForm from './Product/ProductForm';
import ChatPage from './Chat/ChatPage';
import LikeBox from "./components/LikeBox";
import { Routes, Route, useLocation } from "react-router-dom";
import CategoryPostList from './Category/CategoryPostList';
import { publicApi } from './api/auction';
import { PRODUCT_STATUS_LABEL } from './Product/productStatus.js';
import "./App.css";

// ✅ 추가: 비밀번호 찾기 2개 화면
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);
  const [likeCount, setLikeCount] = useState(5);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("used");
  const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'; //백엔드 URL

  //특정 단어로 검색
  const handleSearch = (query) => {
    if (query) {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    }
  };

  useEffect(() => {
    setFrequentKeywords([
      '재테크', '맛집', '카페', '소프트웨어 개발', '프로그래밍', '데이터 관리', 'IT 기술',
      '여행', '건강', '영화', '음악', '독서', '운동', '요리'
    ]);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return;
    const loadProducts = async () => {
      try {
        let data = [];

        if (selectedCategory === 'auction') {
          const raw = await publicApi.get('/api/auction/list').then(r => r.data ?? []);
          data = (Array.isArray(raw) ? raw : []).map(a => ({
            id: a.auctionId ?? a.id,
            title: a.title ?? "",
            content: a.content ?? "",
            currentPrice: a.currentCost ?? a.currentPrice ?? a.startCost ?? 0,
            price: a.buyoutCost ?? a.startCost ?? 0,
            imageUrl: a.thumbnailUrl ?? (a.thumbnailImageId ? `/api/auction/images/${a.thumbnailImageId}` : null),
            endsAt: a.endTime ?? a.endsAt ?? null,
          }));
        } else {
          const res = await publicApi.get('/api/products', {
            params: { page: 0, size: 8, sort: 'createdAt,desc' }
          });
          const items = (res.data?.content ?? []).map(post => ({
            id: post.postId,
            title: post.title,
            description: PRODUCT_STATUS_LABEL[post.productStatus] || "기타",
            price: post.cost,
            imageUrl: post.thumbnail,
            detailUrl: `/products/detail/${post.postId}`
          }));
          data = items;
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('상품 로딩 실패', err);
        setProducts([]);
      }
    };

    loadProducts();
  }, [selectedCategory, BASE, location.pathname]);

  const fetchProducts = () => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      const menuBox = document.getElementById('menuBox');
      const menuToggle = document.getElementById('menuToggle');

      if (menuBox && menuToggle &&
        !menuBox.contains(e.target) &&
        !menuToggle.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutsideMenu);
    return () => document.removeEventListener('click', handleClickOutsideMenu);
  }, []);

  return (
    <Routes>
      {/* 로그인 & 회원가입 */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/editprofile" element={<EditProfile />} />

      {/* ✅ 비밀번호 찾기 / 재설정 */}
      <Route
        path="/forgot"
        element={
          <>
            <TopBar />
            <Header
              onMenuToggle={handleMenuToggle}
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ForgotPassword />
            <MenuBox
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              frequentKeywords={frequentKeywords}
            />
          </>
        }
      />
      <Route
        path="/reset"
        element={
          <>
            <TopBar />
            <Header
              onMenuToggle={handleMenuToggle}
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ResetPassword />
            <MenuBox
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              frequentKeywords={frequentKeywords}
            />
          </>
        }
      />

      {/* 메인 페이지 */}
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
              <ProductList
                products={products}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
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

      {/* 내 상점 */}
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

      {/* 마이페이지 */}
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

      {/* 상품 상세 */}
      <Route
        path="/products/detail/:id"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <ProductDetail />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />

      {/* 상품 관리 */}
      <Route
        path="/myshop/products"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <ProductManagementPage />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />

      {/* 상품 폼 (새 등록) */}
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

      {/* 상품 수정 */}
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

      <Route
        path="/category/:categoryId"
        element={
          <>
            <TopBar />
            <Header
              onMenuToggle={handleMenuToggle}
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <CategoryPostList />
            <MenuBox
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              frequentKeywords={frequentKeywords}
            />
          </>
        }
      />

      {/* 경매 등록 */}
      <Route
        path="/register-auction"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <AuctionRegister />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />

      {/* 경매 수정 */}
      <Route
        path="/auction/edit/:id"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <AuctionEdit />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />

      {/* 경매 상세 */}
      <Route
        path="/auction/detail/:id"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <AuctionDetail />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />

      {/* 채팅 */}
      <Route
        path="/chat"
        element={
          <>
            <TopBar />
            <Header onMenuToggle={handleMenuToggle} onSearch={handleSearch} frequentKeywords={frequentKeywords} />
            <ChatPage />
            <MenuBox isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} frequentKeywords={frequentKeywords} />
          </>
        }
      />
    </Routes>
  );
}

export default App;