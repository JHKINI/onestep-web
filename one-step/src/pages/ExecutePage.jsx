import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ExecutePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const project = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const goal = location.state?.goal || "";
  const task = location.state?.task || "";
  const action = location.state?.action || "";

  const handleComplete = () => {
    navigate("/complete", {
      state: {
        concern: project,
        priority,
        goal,
        task,
        action,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">

        <div className="section-heading">
          <span className="section-index">08</span>

          <h2>
            지금은
            <br />
            이것만 해볼게요.
          </h2>
        </div>

        <p className="section-description">
          다른 것은 잠시 내려놓고
          <br />
          오늘의 한 걸음에만 집중해보세요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            오늘 할 행동
          </div>

          <div className="selected-problem">
            {action}
          </div>
        </div>

        <button
          type="button"
          className="priority-button"
          onClick={handleComplete}
        >
          완료했어요 ✓
        </button>

      </section>
    </main>
  );
}