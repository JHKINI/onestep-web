import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAiCacheKey,
  fetchAiWithCache,
} from "../utils/aiCache";

export default function ActionShrinkPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const concern = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const goal = location.state?.goal || "";
  const task = location.state?.task || "";
  const action = location.state?.action || "";

  const [shrinkActions, setShrinkActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [customAction, setCustomAction] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Gemini JSON 응답을
   * 한 번 더 작게 만든 행동 배열로 변환
   */
  const parseShrinkActions = (text) => {
    try {
      let jsonText = text.trim();

      jsonText = jsonText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const data = JSON.parse(jsonText);

      if (Array.isArray(data.actions)) {
        return data.actions
          .slice(0, 3)
          .filter(
            (item) => typeof item === "string"
          )
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch (error) {
      console.warn(
        "작은 행동 JSON 파싱 실패:",
        error
      );
    }

    return [];
  };

  useEffect(() => {
    let mounted = true;

    const fetchShrinkActions = async () => {
      try {
        const payload = {
          concern,
          goal,
          task,
          action,
        };

        const cacheKey = createAiCacheKey(
          "shrink-actions",
          payload
        );

        const text = await fetchAiWithCache({
          cacheKey,
          url: "http://localhost:8080/api/ai/shrink-actions",
          body: payload,
        });

        if (!mounted) return;

        const parsedActions =
          parseShrinkActions(text);

        if (parsedActions.length === 0) {
          throw new Error(
            "작게 줄인 행동 파싱 실패"
          );
        }

        setShrinkActions(parsedActions);
        setError("");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setError(
          "작게 줄인 행동을 불러오지 못했어요."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchShrinkActions();

    return () => {
      mounted = false;
    };
  }, [concern, goal, task, action]);

  const handleSelect = (value) => {
    setSelectedAction(value);
    setCustomAction("");
  };

  const handleCustomChange = (event) => {
    setCustomAction(event.target.value);
    setSelectedAction("");
  };

  const handleStart = () => {
    const finalAction =
      selectedAction || customAction.trim();

    if (!finalAction) return;

    navigate("/today-action", {
      state: {
        concern,
        priority,
        goal,
        task,
        action: finalAction,
      },
    });
  };

  const finalAction =
    selectedAction || customAction.trim();

  return (
    <main className="page-container">
      <section className="form-panel shrink-panel">

        <div className="section-heading">
          <span className="section-index">
            06-1
          </span>

          <h2>
            조금 부담스럽게
            <br />
            느껴지나요?
          </h2>
        </div>

        <p className="section-description">
          괜찮아요.
          <br />
          지금 선택한 행동을 한 번만 더 작게 만들어볼게요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            선택한 오늘의 행동
          </div>

          <div className="selected-problem">
            {action}
          </div>
        </div>

        <div className="action-guide">
          <h3>
            지금 할 수 있는 크기로 바꿔봤어요.
          </h3>

          <p>
            마음에 드는 하나를 골라주세요.
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            지금 행동을 한 번만 더 작게 만들고 있어요...
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
          <>
            <div className="shrink-card-list">
              {shrinkActions.map(
                (shrinkAction, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`shrink-card ${
                      selectedAction === shrinkAction
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelect(shrinkAction)
                    }
                  >
                    <span className="action-number">
                      {index + 1}
                    </span>

                    <span className="action-content">
                      {shrinkAction}
                    </span>

                    <span className="action-arrow">
                      →
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="custom-action-section">
              <div className="custom-action-title">
                마음에 드는 방법이 없다면
              </div>

              <p className="custom-action-description">
                직접 더 작은 행동을 적어도 괜찮아요.
              </p>

              <textarea
                value={customAction}
                onChange={handleCustomChange}
                placeholder="예: 프로젝트 폴더만 열어보기"
                rows={4}
                className="custom-action-input"
              />
            </div>

            <button
              type="button"
              className="shrink-start-button"
              onClick={handleStart}
              disabled={!finalAction}
            >
              이 행동으로 시작하기
            </button>
          </>
        )}

      </section>
    </main>
  );
}