/**
 * 완료한 한 걸음 기록 저장소.
 *
 * 기록은 백엔드 DB(step_history)에 저장한다.
 * 로그인이 없어서, 브라우저마다 만든 UUID(device id)로 내 기록을 구분한다.
 *
 * localStorage에 남는 것:
 * - one-step:device-id  이 브라우저의 UUID
 * - one-step:history    예전 기록. DB로 옮긴 뒤에도 백업으로 지우지 않는다.
 * - one-step:migrated   예전 기록을 DB로 옮겼는지 표시
 * - one-step:pending    서버가 꺼져 있어서 못 보낸 기록. 다음에 다시 보낸다.
 */

const API_URL = "http://localhost:8080/api/history";

const DEVICE_KEY = "one-step:device-id";
const LEGACY_KEY = "one-step:history";
const MIGRATED_KEY = "one-step:migrated";
const PENDING_KEY = "one-step:pending";

/* ─────────────── localStorage 도우미 ─────────────── */

function readList(key) {
  try {
    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error(`${key}를 읽지 못했어요.`, error);
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (error) {
    console.error(`${key}를 저장하지 못했어요.`, error);
  }
}

// crypto.randomUUID()가 없는 환경(예: http로 다른 PC에서 접속)용 예비 UUID 생성
function makeUuid() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // 버전 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * 이 브라우저의 기기 ID. 처음 한 번 만들고 계속 같은 값을 쓴다.
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY);

  if (!deviceId) {
    deviceId = makeUuid();
    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  return deviceId;
}

/* ─────────────── 서버 요청 ─────────────── */

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": getDeviceId(),
    },
  });

  if (!response.ok) {
    throw new Error(`기록 서버 오류 (HTTP ${response.status})`);
  }

  // 204(삭제 성공)는 본문이 없다
  return response.status === 204 ? null : response.json();
}

// 브라우저 기록 → 서버로 보낼 모양
// 브라우저에서 만든 id를 clientRecordId로 보내서, 여러 번 보내도 한 번만 저장되게 한다.
function toPayload(record) {
  return {
    clientRecordId: record.id,
    project: record.project || "",
    priority: record.priority || "",
    goal: record.goal || "",
    task: record.task || "",
    action: record.action || "",
    completedAt: record.completedAt,
  };
}

/**
 * 브라우저에 남아 있는 기록을 서버로 보낸다.
 * 1) 예전 기록(one-step:history): 처음 한 번만 옮긴다. 원본은 백업으로 남긴다.
 * 2) 대기 중인 기록(one-step:pending): 보내기 성공하면 대기 목록에서 뺀다.
 * 실패하면 예외를 던지고, 다음에 다시 시도한다. (서버가 중복은 알아서 건너뛴다)
 */
async function syncLocalRecords() {
  if (localStorage.getItem(MIGRATED_KEY) !== "true") {
    const legacy = readList(LEGACY_KEY);

    if (legacy.length > 0) {
      await request("/import", {
        method: "POST",
        body: JSON.stringify({ records: legacy.map(toPayload) }),
      });
    }

    localStorage.setItem(MIGRATED_KEY, "true");
  }

  const pending = readList(PENDING_KEY);

  if (pending.length > 0) {
    await request("/import", {
      method: "POST",
      body: JSON.stringify({ records: pending.map(toPayload) }),
    });

    // 보내는 동안 새로 대기에 들어간 기록은 남겨 둔다
    const sentIds = new Set(pending.map((record) => record.id));
    writeList(
      PENDING_KEY,
      readList(PENDING_KEY).filter((record) => !sentIds.has(record.id))
    );
  }
}

/* ─────────────── 화면에서 쓰는 함수 ─────────────── */

/**
 * 완료한 한 걸음 기록 전체 가져오기
 * 반환: { items: 기록 배열(최신순), offline: 서버에 못 붙어서 이 기기 기록만 보여주는지 }
 */
export async function getHistory() {
  try {
    await syncLocalRecords();
    const items = await request("");
    return { items: Array.isArray(items) ? items : [], offline: false };
  } catch (error) {
    console.error("기록 서버에 연결하지 못했어요. 이 기기에 남은 기록만 보여줄게요.", error);

    // 서버가 꺼져 있을 때: 대기 중인 기록 + 예전 백업 기록을 보여준다
    const localItems = [...readList(PENDING_KEY), ...readList(LEGACY_KEY)]
      .map((record) => ({ ...record, local: true }))
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));

    return { items: localItems, offline: true };
  }
}

/**
 * 완료한 한 걸음 기록 추가.
 * 서버에 못 보내면 대기 목록(one-step:pending)에 넣어 두고, 다음에 기록을 불러올 때 다시 보낸다.
 */
export async function saveHistory(record) {
  const newRecord = {
    ...record,
    id: Date.now(),
    completedAt: record.completedAt || new Date().toISOString(),
  };

  try {
    return await request("", {
      method: "POST",
      body: JSON.stringify(toPayload(newRecord)),
    });
  } catch (error) {
    console.error("기록 서버에 저장하지 못해서 대기 목록에 넣어둘게요.", error);
    writeList(PENDING_KEY, [newRecord, ...readList(PENDING_KEY)]);
    return newRecord;
  }
}

/**
 * 기록 1개 삭제. 실패하면 예외를 던진다.
 * - 서버 기록: DB에서 삭제
 * - 아직 못 보낸 대기 기록: 대기 목록에서만 삭제
 */
export async function deleteHistory(item) {
  if (item.local) {
    writeList(
      PENDING_KEY,
      readList(PENDING_KEY).filter((record) => record.id !== item.id)
    );
    return;
  }

  await request(`/${item.id}`, { method: "DELETE" });
}

/**
 * 이 기기의 기록 전체 삭제 (서버 + 대기 목록). 실패하면 예외를 던진다.
 * 예전 기록 백업(one-step:history)은 지우지 않는다. 이미 옮긴 표시가 있어서 다시 올라가지 않는다.
 */
export async function clearHistory() {
  await request("", { method: "DELETE" });
  writeList(PENDING_KEY, []);
}
