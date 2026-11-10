import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConcernInput() {
  const navigate = useNavigate();
  const messagesRef = useRef(null);

  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // 초기 안내 메시지 단계
  const [welcomeStep, setWelcomeStep] = useState(1);

  // 제출 후 답변 단계
  const [replyStep, setReplyStep] = useState(0);

  // 초기 메시지를 하나씩 보여줌
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setWelcomeStep(2);
    }, 500);

    const timer2 = setTimeout(() => {
      setWelcomeStep(3);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 사용자가 프로젝트를 제출한 뒤
  // 봇 메시지를 하나씩 보여줌
  useEffect(() => {
    if (!submitted) return;

    setReplyStep(1);

    const timer1 = setTimeout(() => {
      setReplyStep(2);
    }, 700);

    return () => {
      clearTimeout(timer1);
    };
  }, [submitted]);

  // 새 메시지가 생기면 아래쪽으로 자연스럽게 이동
  useEffect(() => {
    if (!messagesRef.current) return;

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [welcomeStep, submitted, replyStep]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!content.trim()) return;

    setSubmitted(true);
  };

  const handlePrioritySelect = (priority) => {
    navigate("/problem-select", {
      state: {
        concern: content,
        priority,
      },
    });
  };

  return (
    <main className="chat-container">
      <section className="chat-window">

        {/* 헤더 */}
        <header className="chat-header">
          <div className="chat-profile">
            <div className="profile-icon">한</div>

            <div className="chat-profile-text">
              <strong>한 걸음</strong>

              <span>
                막막한 프로젝트를 함께 정리해요
              </span>
            </div>
          </div>
        </header>

        {/* 메시지 영역 */}
        <div
          className="chat-messages"
          ref={messagesRef}
        >

          {/* 첫 번째 받은 메시지 */}
          {welcomeStep >= 1 && (
            <div className="message bot-message message-appear">
              <div className="message-name">
                한 걸음
              </div>

              <div
                className="bubble"
                style={{
                  textAlign: "left",
                }}
              >
                안녕하세요 :)
              </div>
            </div>
          )}

          {/* 두 번째 받은 메시지 */}
          {welcomeStep >= 2 && (
            <div className="message bot-message message-appear">
              <div className="bubble">
                지금 시작하기 막막한 프로젝트가 있나요?
                <br />
                프로젝트가 크고 복잡하게 느껴진다면
                <br />
                편하게 적어주세요.
              </div>
            </div>
          )}

          {/* 세 번째 받은 메시지 */}
          {welcomeStep >= 3 && (
            <div className="message bot-message message-appear">
              <div className="bubble">
                <span className="chat-example">
                  예: 이번 학기 팀 프로젝트를 완성해야 하는데
                  <br />
                  어디부터 시작해야 할지 모르겠어요.
                </span>
              </div>
            </div>
          )}

          {/* 사용자 메시지 */}
          {submitted && (
            <div className="message user-message message-appear">
              <div className="bubble user-bubble">
                {content}
              </div>
            </div>
          )}

          {/* 첫 번째 답변 */}
          {submitted && replyStep >= 1 && (
            <div className="message bot-message message-appear">
              <div className="message-name">
                한 걸음
              </div>

              <div className="bubble">
                이야기해주셔서 고마워요.
                <br />
                프로젝트를 한 번에 완성하려고 하지 않아도 괜찮아요.
              </div>
            </div>
          )}

          {/* 두 번째 답변 */}
          {submitted && replyStep >= 2 && (
            <div className="message bot-message message-appear">
              <div className="bubble">
                먼저 어떤 부분부터 살펴볼지 정해볼게요.
                <br />
                <br />
                프로젝트 안에 해야 할 일이 여러 가지라면
                <br />
                중요한 부분이나 급한 부분부터 살펴보면
                <br />
                시작점을 찾기 쉬워요.
                <br />
                <br />

                <strong>
                  어떤 기준으로 먼저 살펴볼까요?
                </strong>
              </div>

              <div className="chat-choice-buttons">
                <button
                  type="button"
                  onClick={() =>
                    handlePrioritySelect("IMPORTANT")
                  }
                >
                  🟢 가장 중요한 부분부터
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePrioritySelect("URGENT")
                  }
                >
                  🔵 가장 급한 부분부터
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 입력 */}
        {!submitted && (
          <form
            className="chat-input-area"
            onSubmit={handleSubmit}
          >
            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="진행해야 할 프로젝트를 입력해주세요..."
              rows="2"
              maxLength={1000} // DB step_history.project 길이와 같게
            />

            <button
              type="submit"
              className="send-button"
            >
              ➤
            </button>
          </form>
        )}

      </section>
    </main>
  );
}