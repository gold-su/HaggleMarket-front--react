// src/components/LikeBox.jsx
import React from "react";
import "../componentCSS/LikeBox.css"; // CSS 파일 경로를 맞춰주세요

const LikeBox = ({ likeCount }) => {
  return (
    <div className="like-box">
      <h3>찜 목록</h3>
      <div className="like-count">
        현재 찜한 상품: <span>{likeCount}</span> 개
      </div>
    </div>
  );
};

export default LikeBox;
