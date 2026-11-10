const inFlightRequests = new Map();

const CACHE_VERSION = "v3";

/**
 * 문자열을 sessionStorage key로 사용할 수 있는 hash로 변환
 */
function hashString(value) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

/**
 * AI 캐시 key 생성
 */
export function createAiCacheKey(type, payload) {
  const raw = JSON.stringify(payload);

  return `one-step:ai:${CACHE_VERSION}:${type}:${hashString(raw)}`;
}

/**
 * AI 요청
 *
 * - 캐시가 있으면 Gemini 호출 안 함
 * - 같은 요청이 진행 중이면 기존 Promise 공유
 * - Gemini 응답 전체를 받은 뒤에만 캐시 저장
 */
export async function fetchAiWithCache({
  cacheKey,
  url,
  body,
}) {
  // 1. 기존 최종 응답 확인
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    return cached;
  }

  // 2. 동일 요청이 이미 진행 중이면 기존 요청 공유
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. 실제 요청
  const requestPromise = (async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `AI 요청 실패: ${response.status}`
      );
    }

    // 응답이 완전히 끝날 때까지 기다림
    const text = await response.text();

    const finalText = text.trim();

    if (!finalText) {
      throw new Error("AI 응답이 비어 있어요.");
    }

    // 최종 응답만 캐시
    sessionStorage.setItem(
      cacheKey,
      finalText
    );

    return finalText;
  })();

  // 4. 중복 요청 방지
  inFlightRequests.set(
    cacheKey,
    requestPromise
  );

  try {
    return await requestPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * 한 걸음에서 사용하는 AI 캐시만 삭제
 */
export function clearAiCache() {
  Object.keys(sessionStorage)
    .filter((key) =>
      key.startsWith("one-step:ai:")
    )
    .forEach((key) => {
      sessionStorage.removeItem(key);
    });
}