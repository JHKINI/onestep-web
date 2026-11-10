import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAiCacheKey,
  fetchAiWithCache,
} from "../utils/aiCache";

export default function ActionSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const concern = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const goal = location.state?.goal || "";
  const task = location.state?.task || "";

  const [todayActions, setTodayActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Gemini JSON 응답을
   * 오늘 할 행동 배열로 변환
   */
  const parseTodayActions = (text) => {
    try {
      let jsonText = text.trim();

      // ```json ... ``` 형태 제거
      jsonText = jsonText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const data = JSON.parse(jsonText);

      // todayActions 형식
      if (Array.isArray(data.todayActions)) {
        return data.todayActions
          .slice(0, 3)
          .filter((action) => typeof action === "string")
          .map((action) => action.trim())
          .filter(Boolean);
      }

      // 혹시 actions라는 이름으로 응답될 경우도 처리
      if (Array.isArray(data.actions)) {
        return data.actions
          .slice(0, 3)
          .filter((action) => typeof action === "string")
          .map((action) => action.trim())
          .filter(Boolean);
      }
    } catch (error) {
      console.warn(
        "오늘 할 행동 JSON 파싱 실패:",
        error
      );
    }

    return [];
  };

  useEffect(() => {
    let mounted = true;

    const fetchTodayActions = async () => {
      try {
        const payload = {
          concern,
          goal,
          task,
        };

        const cacheKey = createAiCacheKey(
          "today-actions",
          payload
        );

        const text = await fetchAiWithCache({
          cacheKey,
          url: "http://localhost:8080/api/ai/today-actions",
          body: payload,
        });

        if (!mounted) return;

        const parsedActions = parseTodayActions(text);

        if (parsedActions.length === 0) {
          throw new Error(
            "오늘 할 행동 파싱 실패"
          );
        }

        setTodayActions(parsedActions);
        setError("");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setError(
          "오늘 할 행동을 불러오지 못했어요."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTodayActions();

    return () => {
      mounted = false;
    };
  }, [concern, goal, task]);

  const handleSelect = (action) => {
    navigate("/action-start", {
      state: {
        concern,
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
          <span className="section-index">
            05
          </span>

          <h2>
            이제 오늘 할 수 있는
            <br />
            행동으로 더 작게 만들어볼게요.
          </h2>
        </div>

        <p className="section-description">
          선택한 과제를 오늘 바로 시작할 수 있는 행동으로
          <br />
          구체적으로 나눠봤어요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            선택한 목표
          </div>

          <div className="selected-problem">
            {goal}
          </div>

          <div
            className="preview-label"
            style={{ marginTop: "15px" }}
          >
            선택한 작은 과제
          </div>

          <div className="preview-content">
            {task}
          </div>
        </div>

        <div className="action-guide">
          <h3>
            오늘은 무엇부터 해볼까요?
          </h3>

          <p>
            지금 바로 시작할 수 있을 것 같은 하나를 골라주세요.
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            선택한 과제를 오늘 할 수 있는 행동으로
            만들고 있어요...
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
            {todayActions.map((action, index) => (
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

      </section>
    </main>
  );
}