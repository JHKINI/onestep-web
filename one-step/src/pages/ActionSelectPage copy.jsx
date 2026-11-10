import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ActionSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const actions = location.state?.actions || [];

  const handleSelect = (action) => {
    navigate("/action-start", {
      state: {
        action,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">
        <div className="section-heading">
          <span className="section-index">04</span>

          <h2>그중 지금 할 수 있는 것 하나를 골라주세요.</h2>
        </div>

        <p className="section-description">
          지금 당장 시작할 수 있는 행동 하나를 선택해주세요.
        </p>

        <div className="priority-buttons">
          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className="priority-button"
              onClick={() => handleSelect(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}