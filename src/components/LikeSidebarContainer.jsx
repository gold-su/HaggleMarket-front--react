import React, { useEffect, useState } from "react";
import { fetchSidebarLikes } from "../api/likes";
import LikeBox from "./LikeBox";

export default function LikeSidebarContainer() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchSidebarLikes(20);
        if (!alive) return;
        setItems(Array.isArray(list) ? list : []);
        setCount(list?.length ?? 0);
      } catch (e) {
        console.error("sidebar likes load failed", e);
        if (alive) {
          setItems([]);
          setCount(0);
        }
      }
    })();
    return () => (alive = false);
  }, []);

  return <LikeBox likeCount={count} items={items} initiallyOpen={true} />;
}
