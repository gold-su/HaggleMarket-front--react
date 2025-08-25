import React, { useEffect, useState } from 'react';
import { fetchBidHistory } from '../api/auction';
import styles from '../AuctionCSS/AuctionDetail.module.css';

const money = (n) => Number(n ?? 0).toLocaleString('ko-KR');
const pickNick = (it) =>
    it.bidderNickname || it.bidderNick || it.nickname || it.bidderName || '익명';
const pickTime = (it) => it.bidTime || it.time || it.createdAt;

export default function BidHistoryModal({ open, onClose, auctionId }) {
    const [pageNo, setPageNo] = useState(0);
    const [items, setItems] = useState([]);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        // 초기화
        setPageNo(0);
        setItems([]);
        setHasNext(false);
    }, [open, auctionId]);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const page = await fetchBidHistory(auctionId, {
                    page: pageNo,
                    size: 20,
                    sort: 'bidTime,DESC',
                });
                if (cancelled) return;
                setItems((prev) => (pageNo === 0 ? page.content : [...prev, ...page.content]));
                setHasNext(!page.last);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, auctionId, pageNo]);

    if (!open) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>입찰 내역</h3>
                    <button className={styles.modalClose} onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <table className={styles.bidTable}>
                        <thead>
                            <tr>
                                <th>닉네임</th>
                                <th>날짜</th>
                                <th>시간</th>
                                <th className={styles.colAmount}>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className={styles.emptyRow}>
                                        입찰 내역이 없습니다.
                                    </td>
                                </tr>
                            )}

                            {items.map((it, idx) => {
                                const t = new Date(pickTime(it));
                                const dateStr = t.toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                });
                                const timeStr = t.toLocaleTimeString('ko-KR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false,
                                });
                                const key = it.bidId ?? `${pickTime(it)}-${idx}`;
                                return (
                                    <tr key={key}>
                                        <td className={styles.bidColNick}>{pickNick(it)}</td>
                                        <td className={styles.bidColDate}>{dateStr}</td>
                                        <td className={styles.bidColTime}>{timeStr}</td>
                                        <td className={styles.bidColAmount}>{money(it.bidAmount)}원</td>
                                    </tr>
                                );
                            })}

                            {loading && (
                                <tr>
                                    <td colSpan={4} className={styles.loadingRow}>
                                        불러오는 중…
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    );
}
