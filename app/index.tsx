// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

type ApiTest = {
    id: string;
    name: string;
    description: string;
    tags: string[];
    level: string;
    numberOfTasks: number;
};

const TESTS_URL = "https://tgryl.pl/quiz/tests";

export default function Home() {
    const [completedTests, setCompletedTests] = useState<string[]>([]);
    const [tests, setTests] = useState<ApiTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadTests = async () => {
        try {
            setErrorMsg(null);
            const res = await fetch(TESTS_URL, { method: "GET", headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error(`Błąd HTTP: ${res.status}`);
            const data = await res.json();
            setTests(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setErrorMsg(e?.message ?? "Nie udało się pobrać testów");
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
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
            <ScrollView contentContainerStyle={styles.container}>
                {errorMsg && (
                    <Text style={{ color: "#ff8a8a", marginBottom: 12, textAlign: "center" }}>{errorMsg}</Text>
                )}

                {tests.map((test) => (
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
    container: { flex: 1, padding: 20, backgroundColor: "#1a1a1d" },

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
});
