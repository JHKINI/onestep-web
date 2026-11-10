import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TodayActionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const action = location.state?.action || "이력서 확인하기";

  // 앞 화면에서 받은 프로젝트·우선순위·목표·과제를 다음 화면으로 그대로 넘긴다
  // (빠지면 완료 기록에 action만 저장됨)
  const nextState = { ...location.state, action };

  return (
    <main className="page-container">
      <section className="form-panel">
        <div className="section-heading">
          <span className="section-index">07</span>
          <h2>오늘의 한 걸음</h2>
        </div>

        <p className="section-description">
          오늘은 이것 하나만 해보세요.
        </p>

        <h3>{action}</h3>

        <button
          className="button-primary"
          onClick={() =>
            navigate("/execute", { state: nextState })
          }
        >
          시작하기 →
        </button>
      </section>
    </main>
  );
}