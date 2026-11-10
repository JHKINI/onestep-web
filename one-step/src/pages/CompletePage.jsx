import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveHistory } from "../utils/oneStepHistory";

export default function CompletePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const project = location.state?.concern || "";
  const priority = location.state?.priority || "";
  const goal = location.state?.goal || "";
  const task = location.state?.task || "";
  const action = location.state?.action || "";

  const savedRef = useRef(false);

  useEffect(() => {
    // React StrictMode에서 개발 중 effect가 두 번 실행되어도
    // 같은 기록이 중복 저장되지 않도록 방지
    if (savedRef.current) {
      return;
    }

    savedRef.current = true;

    // 실제 행동이 있는 경우에만 기록
    if (action.trim()) {
      saveHistory({
        project,
        priority,
        goal,
        task,
        action,
      });
    }
  }, [
    project,
    priority,
    goal,
    task,
    action,
  ]);

  const handleGoFruit = () => {
    navigate("/fruit");
  };

  return (
    <main className="page-container">
      <section className="form-panel">

        <div className="section-heading">
          <span className="section-index">09</span>

          <h2>
            한 걸음 완료!
            <br />
            오늘의 행동을 해냈어요. 🎉
          </h2>
        </div>

        <p className="section-description">
          작은 행동 하나를 실제로 완료했어요.
          <br />
          이 한 걸음이 기록으로 남았어요.
        </p>

        <div className="selected-problem-box">
          <div className="preview-label">
            오늘 완료한 행동
          </div>

          <div className="selected-problem">
            {action || "완료한 행동"}
          </div>

          {goal && (
            <>
              <div
                className="preview-label"
                style={{ marginTop: "15px" }}
              >
                목표
              </div>

              <div className="preview-content">
                {goal}
              </div>
            </>
          )}

          {task && (
            <>
              <div
                className="preview-label"
                style={{ marginTop: "15px" }}
              >
                작은 과제
              </div>

              <div className="preview-content">
                {task}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "64px",
            margin: "35px 0 25px",
          }}
        >
          🍎
        </div>

        <button
          type="button"
          className="priority-button"
          onClick={handleGoFruit}
        >
          과일 바구니 보기
        </button>

      </section>
    </main>
  );
}