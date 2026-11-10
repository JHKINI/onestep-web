import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-container">

      <div className="decor decor-flower">🌼</div>
      <div className="decor decor-apple">🍎</div>
      <div className="decor decor-clover">☘️</div>
      <div className="decor decor-star">⭐</div>

      <section className="home-content">

        <div className="home-patch">
          <span>🌿</span>
          <span>ONE STEP</span>
          <span>🍎</span>
        </div>

        <p className="home-label">오늘의 작은 한 걸음</p>

        <h1>
          복잡한 생각을
          <br />
          <span>한 걸음씩</span> 정리해볼까요?
        </h1>

        <p className="home-description">
          해야 할 과제나 목표를 한 번에 해결하지 않아도 괜찮아요.
          <br />
          오늘 할 수 있는 작은 행동 하나부터 시작해보세요.
        </p>

        <button
          className="button-primary home-button"
          onClick={() => navigate("/concern")}
        >
          고민 시작하기 →
           <span></span>
        </button>
        <p className="home-small">
          생각은 정리하고, 행동은 하나만.
        </p>
        
      </section>
    </main>
  );
}