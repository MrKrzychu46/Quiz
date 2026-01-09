// services/testsStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";


const TESTS_KEY = "tests_cache_v1";
const TESTS_LAST_FETCH_KEY = "tests_cache_last_fetch_v1";
const TEST_DETAILS_PREFIX = "test_details_v1:";

const TESTS_URL = "https://tgryl.pl/quiz/tests";
const TEST_DETAILS_URL = (id: string) => `https://tgryl.pl/quiz/test/${id}`;

async function hasInternet(): Promise<boolean> {
    const state = await NetInfo.fetch();
    // isInternetReachable bywa null na starcie, więc bierzemy to “bezpiecznie”
    if (state.isInternetReachable === false) return false;
    return !!state.isConnected;
}


export type ApiTest = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    level: string;
    numberOfTasks: number;
};

export type ApiTestDetails = {
    id: string;
    name: string;
    description: string;
    level: string;
    tags: string[];
    tasks: {
        question: string;
        answers: { content: string; isCorrect: boolean }[];
        duration?: number;
    }[];
};

export async function loadCachedTests(): Promise<ApiTest[]> {
    const raw = await AsyncStorage.getItem(TESTS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function saveCachedTests(tests: ApiTest[]): Promise<void> {
    await AsyncStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    await AsyncStorage.setItem(TESTS_LAST_FETCH_KEY, String(Date.now()));
}

export async function getLastFetchMs(): Promise<number | null> {
    const raw = await AsyncStorage.getItem(TESTS_LAST_FETCH_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export async function shouldRefreshDaily(nowMs = Date.now()): Promise<boolean> {
    const last = await getLastFetchMs();
    if (!last) return true;
    const DAY_MS = 24 * 60 * 60 * 1000;
    return nowMs - last >= DAY_MS;
}

export async function fetchTestsFromServer(): Promise<ApiTest[]> {
    const res = await fetch(TESTS_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

// ✅ najważniejsza funkcja: uruchamiasz ją przy starcie aplikacji
export async function ensureDailyTestsCache(): Promise<ApiTest[]> {
    const cached = await loadCachedTests();

    const online = await hasInternet();
    if (!online) return cached;

    const needsRefresh = await shouldRefreshDaily();
    if (!needsRefresh) return cached;

    const fresh = await fetchTestsFromServer();
    await saveCachedTests(fresh);
    await prefetchAndCacheAllTestDetails(fresh);

    return fresh;

}


// (opcjonalnie, ale polecam) cache szczegółów testu
export async function loadCachedTestDetails(id: string): Promise<ApiTestDetails | null> {
    const raw = await AsyncStorage.getItem(TEST_DETAILS_PREFIX + id);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function fetchTestDetailsFromServer(id: string): Promise<ApiTestDetails> {
    const res = await fetch(TEST_DETAILS_URL(id), { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
    return await res.json();
}

export async function getTestDetails(id: string): Promise<ApiTestDetails> {
    const cached = await loadCachedTestDetails(id);
    if (cached) return cached;

    const online = await hasInternet();
    if (!online) {
        throw new Error("Brak internetu i brak zapisanych szczegółów tego testu.");
    }

    const fresh = await fetchTestDetailsFromServer(id);
    await AsyncStorage.setItem(TEST_DETAILS_PREFIX + id, JSON.stringify(fresh));
    return fresh;
}

export async function prefetchAndCacheAllTestDetails(tests: ApiTest[]): Promise<void> {
    // pobieramy po kolei (bezpiecznie, żeby nie zabić API równoległością)
    for (const t of tests) {
        try {
            const details = await fetchTestDetailsFromServer(t.id);
            await AsyncStorage.setItem(TEST_DETAILS_PREFIX + t.id, JSON.stringify(details));
        } catch {
            // jak pojedynczy test się nie pobierze, nie wywalamy całości
        }
    }
}

