// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import _ from "lodash";
import { ensureDailyTestsCache, loadCachedTests, type ApiTest } from "./services/testsStorage";
import NetInfo from "@react-native-community/netinfo";

export default function Home() {
    const [completedTests, setCompletedTests] = useState<string[]>([]);
    const [tests, setTests] = useState<ApiTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(true);


    useEffect(() => {
        const init = async () => {
            try {
                setErrorMsg(null);

                // najpierw pokaż cache
                const cached = await loadCachedTests();
                setTests(cached);

                const net = await NetInfo.fetch();
                const online =
                    net.isConnected === true &&
                    net.isInternetReachable !== false;

                if (!online) {
                    setIsOffline(true);

                    if (cached.length === 0) {
                        setErrorMsg("Brak internetu i brak zapisanych testów.");
                    } else {
                        setErrorMsg("Brak internetu – wyświetlam zapisane testy.");
                    }
                    return;
                }

                setIsOffline(false);

                // potem dociągnij świeże raz na dobę (jeśli trzeba)
                const freshOrCached = await ensureDailyTestsCache();
                setTests(freshOrCached);
            } catch (e: any) {
                setErrorMsg(e?.message ?? "Nie udało się wczytać testów");
                setTests([]);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    useEffect(() => {
        const unsub = NetInfo.addEventListener((state) => {
            console.log("NETINFO:", state);
            const offline = state.isConnected === false || state.isInternetReachable === false;
            setIsOffline(offline);
        });

        return () => unsub();
    }, []);



    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const stored = await AsyncStorage.getItem("quiz_results");
                if (stored) {
                    const arr = JSON.parse(stored);
                    // ⬇️ teraz testId jest stringiem
                    setCompletedTests(arr.map((r: any) => String(r.testId)));
                } else {
                    setCompletedTests([]);
                }
            };

            load();
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#783cff" />
                <Text style={{ color: "#cfcfcf", marginTop: 12 }}>Pobieram testy...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>
                        Brak połączenia z internetem – tryb offline
                    </Text>
                </View>
            )}
            <ScrollView contentContainerStyle={styles.container}>
                {errorMsg && (
                    <Text style={{ color: "#ff8a8a", marginBottom: 12, textAlign: "center" }}>{errorMsg}</Text>
                )}

                {_.shuffle(tests).map((test) => (
                    <TestCard
                        key={test.id}
                        id={test.id}
                        title={test.name}
                        tags={test.tags?.length ? test.tags : ["Quiz", "Test"]}
                        description={`Liczba pytań: ${test.numberOfTasks}`}
                        completedTests={completedTests}
                    />
                ))}

                {/* STOPKA */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Get to know your ranking result</Text>
                    <TouchableOpacity style={styles.footerButton} onPress={() => router.push("/results")}>
                        <Text style={styles.footerButtonText}>Check!</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

type TestCardProps = {
    id: string;              // ⬅️ było number
    title: string;
    tags: string[];
    description: string;
    completedTests: string[]; // ⬅️ było number[]
};

function TestCard({ id, title, tags, description, completedTests }: TestCardProps) {
    const isDone = completedTests.includes(id);

    return (
        <TouchableOpacity
            style={[styles.card, isDone && styles.cardDisabled]}
            onPress={() => {
                if (!isDone) router.push(`/test/${id}`);
            }}
            disabled={isDone}
        >
            <Text style={styles.cardTitle}>{title}</Text>

            {isDone && <Text style={{ color: "lime", marginBottom: 10 }}>✓ Ukończono</Text>}

            <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>#{tag}</Text>
                ))}
            </View>

            <Text style={styles.cardDescription}>{description}</Text>
        </TouchableOpacity>
    );
}

// ✅ Twoje styles zostają bez zmian


const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#1a1a1d" },

    card: {
        backgroundColor: "#26262b",
        padding: 18,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.35)",
    },

    cardDisabled: {
        opacity: 0.35,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },

    tagsContainer: { flexDirection: "row", marginVertical: 10 },

    tag: { marginRight: 10, color: "#b38aff", fontSize: 14, fontWeight: "600" },

    cardDescription: { fontSize: 15, color: "#cfcfcf", lineHeight: 20 },

    footer: { marginTop: 35, alignItems: "center", paddingBottom: 60 },
    footerText: { fontSize: 18, marginBottom: 15, color: "#fff" },

    footerButton: {
        backgroundColor: "#26262b",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.4)",
    },

    footerButtonText: { fontSize: 18, fontWeight: "bold", color: "#e6e6e6" },

    offlineBanner: {
        backgroundColor: "#3a1d1d",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ff8a8a",
    },

    offlineText: {
        color: "#ff8a8a",
        textAlign: "center",
        fontWeight: "600",
    },

});
