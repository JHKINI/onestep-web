import React from "react";

export default function ConcernForm({
  content,
  onContentChange,
  onSubmit,
  message,
}) {
  return (
    <section className="form-panel" aria-labelledby="form-heading">
      <div className="section-heading">
        <span className="section-index" aria-hidden="true">
          01
        </span>

        <h2 id="form-heading">
          지금 해결하고 싶은 문제는 무엇인가요?
        </h2>
      </div>

      <p className="section-description">
        지금 머릿속에 있는 고민이나 해결하고 싶은 문제를 적어주세요.
      </p>

      <form onSubmit={onSubmit} className="concern-form">
        <label className="field">
          <span className="field-label">
            고민 <span className="required-label">필수</span>
          </span>

          <textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="예: 취업 준비를 해야 하는데 어디서부터 시작해야 할지 모르겠어요."
            required
            rows="5"
            maxLength={1000} // DB step_history.project 길이와 같게
          />
        </label>

        <button type="submit" className="button-primary">
          다음으로 <span aria-hidden="true">→</span>
        </button>

        <p className="form-message" role="status">
          {message}
        </p>
      </form>
    </section>
  );
}