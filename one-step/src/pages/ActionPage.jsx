import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAiCacheKey,
  fetchAiWithCache,
} from "../utils/aiCache";

export default function ActionPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const concern = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const goal = location.state?.goal || "";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Gemini JSON 응답을 작은 과제 배열로 변환
   */
  const parseTasks = (text) => {
    try {
      let jsonText = text.trim();

      // ```json ... ``` 형태 제거
      jsonText = jsonText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const data = JSON.parse(jsonText);

      if (Array.isArray(data.tasks)) {
        return data.tasks
          .slice(0, 3)
          .filter((task) => typeof task === "string")
          .map((task) => task.trim())
          .filter(Boolean);
      }
    } catch (error) {
      console.warn("작은 과제 JSON 파싱 실패:", error);
    }

    return [];
  };

  useEffect(() => {
    let mounted = true;

    const fetchTasks = async () => {
      try {
        const payload = {
          concern,
          problem: goal,
        };

        const cacheKey = createAiCacheKey(
          "tasks",
          payload
        );

        const text = await fetchAiWithCache({
          cacheKey,
          url: "http://localhost:8080/api/ai/actions",
          body: payload,
        });

        if (!mounted) return;

        const parsedTasks = parseTasks(text);

        if (parsedTasks.length === 0) {
          throw new Error("작은 과제 파싱 실패");
        }

        setTasks(parsedTasks);
        setError("");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setError(
          "작은 과제를 불러오지 못했어요."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchTasks();

    return () => {
      mounted = false;
    };
  }, [concern, goal]);

  const handleSelect = (task) => {
    navigate("/action-select", {
      state: {
        concern,
        priority,
        goal,
        task,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">

        <div className="section-heading">
          <span className="section-index">
            04
          </span>

          <h2>
            이 목표를 이루기 위한
            <br />
            작은 과제를 찾아봤어요.
          </h2>
        </div>

        <p className="section-description">
          선택한 목표를 한 번에 이루려고 하지 않아도 괜찮아요.
          <br />
          목표를 이루기 위해 먼저 해볼 수 있는 작은 과제로
          나눠봤어요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            선택한 목표
          </div>

          <div className="selected-problem">
            {goal}
          </div>
        </div>

        <div className="action-guide">
          <h3>
            어떤 과제부터 해볼까요?
          </h3>

          <p>
            지금 먼저 해보고 싶은 과제를 골라주세요.
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            선택한 목표를 작은 과제로 나누고 있어요...
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
            {tasks.map((task, index) => (
              <button
                key={index}
                type="button"
                className="action-card"
                onClick={() => handleSelect(task)}
              >
                <span className="action-number">
                  {index + 1}
                </span>

                <span className="action-content">
                  {task}
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