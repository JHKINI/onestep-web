import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createAiCacheKey,
  fetchAiWithCache,
} from "../utils/aiCache";

export default function ProblemSelectPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 현재 서비스에서는 프로젝트를 입력값으로 사용
  // 기존 state 이름은 다른 페이지와의 호환을 위해 concern 유지
  const project = location.state?.concern || "";
  const priority = location.state?.priority || "";

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Gemini JSON 응답을 목표 배열로 변환
   */
  const parseGoals = (text) => {
    try {
      let jsonText = text.trim();

      // ```json ... ``` 형태로 오는 경우 제거
      jsonText = jsonText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const data = JSON.parse(jsonText);

      if (Array.isArray(data.goals)) {
        return data.goals
          .slice(0, 3)
          .map((goal) => ({
            title: goal.title || "",
            description: goal.description || "",
          }))
          .filter((goal) => goal.title);
      }
    } catch (error) {
      console.warn("JSON 파싱 실패:", error);
    }

    return [];
  };

  useEffect(() => {
    let mounted = true;

    const fetchGoals = async () => {
      try {
        const payload = {
          concern: project,
          priority,
        };

        const cacheKey = createAiCacheKey(
          "goals",
          payload
        );

        const text = await fetchAiWithCache({
          cacheKey,
          url: "http://localhost:8080/api/ai/problems",
          body: payload,
        });

        if (!mounted) return;

        const parsedGoals = parseGoals(text);

        if (parsedGoals.length === 0) {
          throw new Error("목표 후보 파싱 실패");
        }

        setGoals(parsedGoals);
        setError("");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setError(
          "목표 후보를 불러오지 못했어요."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGoals();

    return () => {
      mounted = false;
    };
  }, [project, priority]);

  const handleSelect = (goal) => {
    navigate("/action", {
      state: {
        concern: project,
        priority,
        goal: goal.title,
      },
    });
  };

  return (
    <main className="page-container">
      <section className="form-panel">

        <div className="section-heading">
          <span className="section-index">
            03
          </span>

          <h2>
            현재 프로젝트에서
            <br />
            먼저 다뤄볼 목표를 찾아봤어요.
          </h2>
        </div>

        <p className="section-description">
          아까 선택한 기준을 바탕으로
          <br />
          프로젝트에서 먼저 다뤄볼 목표를 정리해봤어요.
        </p>

        <div className="concern-preview">
          <div className="preview-label">
            지금 이야기한 프로젝트
          </div>

          <div className="preview-content">
            {project}
          </div>
        </div>

        <div className="problem-guide">
          <h3>
            어떤 목표를 먼저 다뤄볼까요?
          </h3>

          <p>
            정답은 없어요.
            <br />
            지금 가장 먼저 해보고 싶은 목표를 골라주세요.
          </p>
        </div>

        {loading && (
          <div className="loading-message">
            프로젝트를 살펴보고 목표 후보를 만들고 있어요...
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
          <div className="problem-card-list">
            {goals.map((goal, index) => (
              <button
                key={index}
                type="button"
                className="problem-card"
                onClick={() => handleSelect(goal)}
              >
                <div className="problem-card-title">
                  {goal.title}
                </div>

                <div className="problem-card-description">
                  {goal.description}
                </div>

                <div className="problem-card-arrow">
                  →
                </div>
              </button>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}