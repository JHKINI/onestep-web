import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ActionStartPage() {
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
          <span className="section-index">05</span>
          <h2>오늘 이것부터 시작할 수 있나요?</h2>
        </div>

        <p className="section-description">{action}</p>

        <div className="priority-buttons">
          <button
            className="priority-button"
            onClick={() =>
              navigate("/today-action", { state: nextState })
            }
          >
            네, 시작할 수 있어요
          </button>

          <button
            className="priority-button"
            onClick={() =>
              navigate("/action-shrink", { state: nextState })
            }
          >
            조금 부담스러워요
          </button>
        </div>
      </section>
    </main>
  );
}