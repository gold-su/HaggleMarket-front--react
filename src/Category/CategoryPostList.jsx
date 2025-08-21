// src/Category/CategoryPostList.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../MainPages/ProductCard';

function CategoryPostList() {
    const { categoryId } = useParams();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get(`/api/categories/${categoryId}/posts`)
            .then((res) => {
                const productStatusMap = {
                    LIKE_NEW: "새 상품",
                    USED_GOOD: "사용감 적음",
                    USED: "사용감 많음",
                    DAMAGED: "고장/파손"
                };

                const mappedPosts = res.data.map(post => ({
                    id: post.postId,
                    title: post.title,
                    content: productStatusMap[post.productStatus] || '',  // 상태 설명 → content로
                    price: post.cost.toLocaleString() + '원',
                    imageUrl: post.thumbnail
                }));

                setPosts(mappedPosts);
            })
            .catch((err) => console.error("카테고리 게시글 조회 실패", err));
    }, [categoryId]);

    return (
        <div className="product-list">
            {posts.length > 0 ? (
                posts.map(post => (
                    <ProductCard key={post.id} product={post} />
                ))
            ) : (
                <p>해당 카테고리의 게시물이 없습니다.</p>
            )}
        </div>
    );
}

export default CategoryPostList;