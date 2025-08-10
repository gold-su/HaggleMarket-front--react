import axios from 'axios';
import React, { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import logo from "./logo.svg";
import Header from './components/Header';
import MenuBox from './MainPages/MenuBox';
import TopBar from "./components/TopBar";
import ProductList from './MainPages/ProductList';
import MyShop from './Shop/MyShop';
import AuctionAdSection from './MainPages/AuctionAdSection';
import EditProfile from './editPage/EditProfile';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LikeBox from "./components/LikeBox";
import "./App.css";
import ProductDetail from './Product/ProductDetail';
import ProductForm from './Product/ProductForm';
import CategoryPostList from './Category/CategoryPostList';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);
  const [likeCount, setLikeCount] = useState(5);

  useEffect(() => {
    setFrequentKeywords([
      '재테크', '맛집', '카페', '소프트웨어 개발', '프로그래밍', '데이터 관리', 'IT 기술',
      '여행', '건강', '영화', '음악', '독서', '운동', '요리'
    ]);

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
      const menuBoxElement = document.getElementById('menuBox');
      const menuToggleElement = document.getElementById('menuToggle');

      if (menuBoxElement && menuToggleElement && !menuBoxElement.contains(e.target) && !menuToggleElement.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutsideMenu);
    return () => {
      document.removeEventListener('click', handleClickOutsideMenu);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/editprofile" element={<EditProfile />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
