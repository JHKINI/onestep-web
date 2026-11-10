import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PrioritySelectPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const concern = location.state?.concern || "";

  const handlePrioritySelect = (priority) => {
    navigate("/action", {
      state: {
        concern,
        priority,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">
        <div className="section-heading">
          <span className="section-index">02</span>

          <h2>해결할 문제 선택</h2>
        </div>

        <p className="section-description">
          지금 입력한 고민에서 무엇을 먼저 해결할지 선택해주세요.
        </p>

        {concern && (
          <div className="concern-preview">
            {concern}
          </div>
        )}

        <div className="priority-buttons">
          <button
            type="button"
            className="priority-button"
            onClick={() => handlePrioritySelect("IMPORTANT")}
          >
            🟢 가장 중요하게 해결해야 하는 문제
          </button>

          <button
            type="button"
            className="priority-button"
            onClick={() => handlePrioritySelect("URGENT")}
          >
            🔵 가장 시급하게 해결해야 하는 문제
          </button>
        </div>
      </section>
    </main>
  );
}