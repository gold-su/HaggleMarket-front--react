import axios from 'axios';
import React, { useState, useEffect, use } from "react";
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
// import ProductRegister from './Product/ProductRegister';
import ProductDetail from './Product/ProductDetail';
import ProductForm from './Product/ProductForm';
import ChatPage from './Chat/ChatPage';
import LikeBox from "./components/LikeBox";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CategoryPostList from './Category/CategoryPostList';
import { fetchUsedList, fetchAuctionList } from './services/productApi';
import "./App.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);
  const [likeCount, setLikeCount] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("used");
  const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'; //백엔드 URL


  useEffect(() => {
    setFrequentKeywords([
      '재테크', '맛집', '카페', '소프트웨어 개발', '프로그래밍', '데이터 관리', 'IT 기술',
      '여행', '건강', '영화', '음악', '독서', '운동', '요리'
    ]);

    axios
      .get(`${BASE}/api/products?page=0&size=8&sort=createdAt,desc`)
      .then((res) => {
        const productStatusMap = {
          LIKE_NEW: "새 상품",
          USED_GOOD: "사용감 적음",
          USED: "사용감 많음",
          DAMAGED: "고장/파손"
        };

        const items = res.data.content.map((post) => ({
          id: post.postId,
          title: post.title,
          description: productStatusMap[post.productStatus] || "기타",
          price: post.cost.toLocaleString() + '원',
          imageUrl: post.thumbnail,
          detailUrl: `/product-detail/${post.postId}`
        }));

        setProducts(items);
      })
      .catch((err) => console.error('게시물 로딩 실패', err));
  }, []);

  const handleSearch = (query) => {
    if (query) {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    }
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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const list =
          selectedCategory === 'auction'
            ? await fetchAuctionList()
            : await fetchUsedList();

        setProducts(list);
      } catch (err) {
        console.error('상품 로딩 실패', err);
      }
    };

    loadProducts();
  }, [selectedCategory]);
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 & 회원가입 */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editprofile" element={<EditProfile />} />

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
                  onCategoryChange={setSelectedCategory} //변경 핸들러 전달
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
          path="/product-detail/:id"
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
          path="/edit-auction"
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
    </BrowserRouter>
  );
}

export default App;
