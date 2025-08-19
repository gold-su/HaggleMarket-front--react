import { useCallback, useEffect, useState } from "react";
import { fetchUsedList, fetchAuctionList } from "../services/productsApi";

export default function useProducts(initial = "used") {
    const [category, setCategory] = useState(initial); // 'used' | 'auction'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async (cat = category) => {
        setLoading(true); setError("");
        try {
            const data = cat === "auction"
                ? await fetchAuctionList()
                : await fetchUsedList();

            setProducts(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setError("상품을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => { load(category); }, [category, load]);

    return { category, setCategory, products, loading, error, refetch: () => load(category) };
}
