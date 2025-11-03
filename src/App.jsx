import axios from "axios";
import React, { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Header from "./components/Header";
import TopBar from "./components/TopBar";
import ProductList from "./MainPages/ProductList";
import AuctionAdSection from "./MainPages/AuctionAdSection";
import AuctionRegister from "./Auction/AuctionRegister";
import AuctionEdit from "./Auction/AuctionEdit";
import AuctionDetail from "./Auction/AuctionDetail";
import MyShop from "./Shop/MyShop";
import ShopDetail from "./Shop/ShopDetail.jsx";
import EditProfile from "./editPage/EditProfile";
// import ProductRegister from './Product/ProductRegister';
import ProductDetail from "./Product/ProductDetail";
import ProductForm from "./Product/ProductForm";
import ChatPage from "./Chat/ChatPage";
import LikeSidebarContainer from "./components/LikeSidebarContainer.jsx";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import CategoryPostList from "./Category/CategoryPostList";
import { fetchUsedList, fetchAuctionList } from "./services/productApi.js";
import { publicApi, api } from "./api/auction";
import { PRODUCT_STATUS_LABEL } from "./Product/productStatus.js";
import "./App.css";
import SearchPage from "./search/SearchPage.jsx";

// ✅ 추가: 비밀번호 찾기 2개 화면
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    // 메시지를 1회만 보여주기 위해 setTimeout으로 비동기 처리
    setTimeout(() => {
      alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
    }, 0);
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [frequentKeywords, setFrequentKeywords] = useState([]);
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("used");
  const BASE =
    import.meta.env.VITE_API_BASE ?? "https://hagglemarket.onrender.com"; //백엔드 URL
  const navigate = useNavigate();

  //검색코딩
  const handleSearch = (keyword) => {
    const q = (keyword || "").trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q); // 비우면 전체검색도 가능
    params.set("page", "0"); // 새 검색 → 0페이지로
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (location.pathname !== "/") return;
    const loadProducts = async () => {
      try {
        let data = [];

        if (selectedCategory === "auction") {
          // ✅ 1) 경매 원본 응답 찍기
          const raw = await fetchAuctionList(); // 배열 가정 (/api/auction/list)
          console.log("📦 경매 원본 응답:", raw);

          // ✅ 2) 프론트에서 쓰기 편하게 정규화 (ProductCard가 먹는 필드명으로)
          data = (Array.isArray(raw) ? raw : []).map((a) => ({
            // 백엔드 DTO 키에 맞춰 안전하게 매핑
            id: a.auctionId ?? a.id,
            title: a.title ?? "",
            content: a.content ?? "",
            // 가격(경매 카드에선 currentPrice 우선 표시)
            currentPrice: a.currentCost ?? a.currentPrice ?? a.startCost ?? 0,
            price: a.buyoutCost ?? a.startCost ?? 0,
            // 썸네일: 이미지 id만 주면 이미지 API 경로로 만들어줌
            imageUrl:
              a.thumbnailUrl ??
              (a.thumbnailImageId
                ? `/api/auction/images/${a.thumbnailImageId}`
                : null),
            // 마감시간
            endsAt: a.endTime ?? a.endsAt ?? null,
          }));

          // ✅ 3) 정규화 결과도 찍기
          console.log("🧩 경매 정규화 결과:", data);
        } else {
          // 중고 상품 불러오기 (팀원 매핑 로직 유지)
          const res = await publicApi.get("/api/products", {
            params: { page: 0, size: 8, sort: "createdAt,desc" },
          });
          const items = (res.data?.content ?? []).map((post) => ({
            id: post.postId,
            title: post.title,
            description: PRODUCT_STATUS_LABEL[post.productStatus] || "기타",
            price: post.cost,
            imageUrl: post.thumbnail,
            detailUrl: `/products/detail/${post.postId}`,
          }));
          data = items;
        }

        // ✅ 항상 한 번만 세팅 + 방어
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("상품 로딩 실패", err);
        // ✅ 실패해도 렌더는 유지
        setProducts([]);
      }
    };

    loadProducts();
  }, [selectedCategory, BASE, location.pathname]);

  const fetchProducts = () => {
    axios
      .get("/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e) => {
      const menuBox = document.getElementById("menuBox");
      const menuToggle = document.getElementById("menuToggle");

      if (
        menuBox &&
        menuToggle &&
        !menuBox.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutsideMenu);
    return () => document.removeEventListener("click", handleClickOutsideMenu);
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
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ForgotPassword />
          </>
        }
      />

      <Route
        path="/reset"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ResetPassword />
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
            <LikeSidebarContainer />
          </>
        }
      />

      <Route
        path="/myshop"
        element={
          <ProtectedRoute>
            <>
              <TopBar />
              <Header
                onSearch={handleSearch}
                frequentKeywords={frequentKeywords}
              />
              <MyShop />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/shop/:userNo"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ShopDetail />
          </>
        }
      />

      <Route
        path="/search"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <SearchPage />
            <LikeSidebarContainer />
          </>
        }
      />

      {/* 상품 상세 */}
      <Route
        path="/products/detail/:id"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ProductDetail />
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
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ProductForm mode="create" />
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
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ProductForm mode="edit" />
          </>
        }
      />

      <Route
        path="/category/:categoryId"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <CategoryPostList />
          </>
        }
      />

      {/* 경매 등록 */}
      <Route
        path="/register-auction"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <AuctionRegister />
          </>
        }
      />

      {/* 경매 수정 */}
      <Route
        path="/auction/edit/:id"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <AuctionEdit />
          </>
        }
      />

      {/* 경매 상세 */}
      <Route
        path="/auction/detail/:id"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <AuctionDetail />
          </>
        }
      />

      {/* 채팅 */}
      <Route
        path="/chat"
        element={
          <>
            <TopBar />
            <Header
              onSearch={handleSearch}
              frequentKeywords={frequentKeywords}
            />
            <ChatPage />
          </>
        }
      />
    </Routes>
  );
}

export default App;
