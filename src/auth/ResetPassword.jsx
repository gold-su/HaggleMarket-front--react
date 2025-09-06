import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./auth-ui.css";

const RULE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,20}$/;

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const nav = useNavigate();
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const valid = pw && pw2 && pw === pw2 && RULE.test(pw);

    const submit = async (e) => {
        e.preventDefault();
        if (!token) return setErr("유효하지 않은 링크입니다.");
        setLoading(true);
        setErr("");
        try {
            await axios.post("/api/auth/password-reset/confirm", { token, newPassword: pw });
            nav("/login");
        } catch {
            setErr("토큰이 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-scope auth-scope--main">
            <div className="auth-wrap">
                <div className="auth-card">
                    <h1 className="auth-title">새 비밀번호 설정</h1>
                    <p className="auth-sub">영문/숫자/특수문자 포함 8–20자</p>

                    {err && <div className="alert alert--error">{err}</div>}

                    <form onSubmit={submit} className="auth-form" noValidate>
                        <label className="auth-label" htmlFor="pw">새 비밀번호</label>
                        <input
                            id="pw"
                            type="password"
                            className="input"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            required
                        />
                        {!RULE.test(pw) && pw && (
                            <div className="helper">규칙에 맞지 않습니다.</div>
                        )}

                        <label className="auth-label" htmlFor="pw2">비밀번호 확인</label>
                        <input
                            id="pw2"
                            type="password"
                            className="input"
                            value={pw2}
                            onChange={(e) => setPw2(e.target.value)}
                            required
                        />
                        {pw2 && pw !== pw2 && (
                            <div className="helper">비밀번호가 일치하지 않습니다.</div>
                        )}

                        <button
                            className="btn"
                            type="submit"
                            disabled={!valid || loading}
                            aria-busy={loading}
                        >
                            {loading ? "처리 중..." : "비밀번호 변경"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
