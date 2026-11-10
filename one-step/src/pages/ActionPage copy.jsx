import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ActionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const concern = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const problem = location.state?.problem || "";

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/ai/actions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              concern,
              problem,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("AI 행동 후보 생성에 실패했습니다.");
        }

        const text = await response.text();

        const parsedActions = parseActions(text);

        setActions(parsedActions);
      } catch (err) {
        console.error(err);
        setError("행동 후보를 불러오지 못했어요. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    if (concern && problem) {
      fetchActions();
    } else {
      setError("고민 또는 문제 정보가 없습니다.");
      setLoading(false);
    }
  }, [concern, problem]);

  const parseActions = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[1-3]\.\s*/, ""))
      .filter((line) => line.length > 0)
      .slice(0, 3);
  };

  const handleSelect = (action) => {
    navigate("/action-select", {
      state: {
        concern,
        priority,
        problem,
        actions,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">

        <div className="section-heading">
          <span className="section-index">04</span>

          <h2>
            좋아요.
            <br />
            이제 이 문제부터 하나씩 해볼게요.
          </h2>
        </div>

        <p className="section-description">
          처음부터 완벽하게 해결하려고 하지 않아도 괜찮아요.
          <br />
          지금 할 수 있는 작은 행동을 찾아볼게요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            먼저 다뤄볼 문제
          </div>

          <div className="selected-problem">
            {problem}
          </div>
        </div>

        <div className="action-guide">
          <h3>
            지금 할 수 있는 행동을 몇 가지 생각해봤어요.
          </h3>

          <p>
            부담 없이 살펴보고,
            <br />
            지금 해볼 수 있을 것 같은 하나를 골라주세요.
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            지금 할 수 있는 행동을 생각하고 있어요...
            <br />
            잠시만 기다려주세요.
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="action-card-list">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                className="action-card"
                onClick={() => handleSelect(action)}
              >
                <span className="action-number">
                  {index + 1}
                </span>

                <span className="action-content">
                  {action}
                </span>

                <span className="action-arrow">
                  →
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="action-bottom-message">
          마음에 드는 행동이 없다면,
          <br />
          지금은 다른 행동을 선택하지 않아도 괜찮아요.
        </p>

      </section>
    </main>
  );
}