import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../MainPages/ProductCard";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const q = params.get("q") || "";
  const page = Number(params.get("page") || 0);
  const size = Number(params.get("size") || 20);

  useEffect(() => {
    axios.get("/api/search", { params: { q, page, size } })
      .then(res => setData(res.data))
      .catch(() => setData({ content: [], totalPages: 0, totalElements: 0 }));
  }, [q, page, size]);

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  const toCardModel = (item) => {
    const isAuction = item.source === "AUCTION";
    const url = item.thumbnailUrl
      ? item.thumbnailUrl                          // USED(URL)
      : item.thumbnailId
        ? `/api/auction/images/${item.thumbnailId}`// AUCTION(BLOB)
        : undefined;

    return {
      product: {
        id: item.id,
        title: item.title,
        content: item.snippet ?? "",
        price: item.price ?? 0,
        likeCount: item.likeCount ?? 0,
        liked: false,
        thumbnailUrl: url,
      },
      mode: isAuction ? "auction" : "used",
      link: isAuction ? `/auction/detail/${item.id}` : `/products/detail/${item.id}`,
    };
  };

  if (!data) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <h2>검색 결과</h2>
      <div style={{ marginBottom: 12, opacity: .7 }}>
        {q ? `“${q}” 검색 · ` : ""}{data.totalElements}건
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {data.content.map(item => {
          const m = toCardModel(item);
          return (
            <ProductCard
              key={`${item.source}-${item.id}`}
              product={m.product}
              mode={m.mode}
              link={m.link}
            />
          );
        })}
      </div>

      {data.totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <button disabled={page<=0} onClick={()=>setPage(page-1)}>이전</button>
          <span>{page+1} / {data.totalPages}</span>
          <button disabled={page+1>=data.totalPages} onClick={()=>setPage(page+1)}>다음</button>
        </div>
      )}
    </div>
  );
}
