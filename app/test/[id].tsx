// app/test/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";
import { getTestDetails } from "../services/testsStorage";

type AppTest = {
    id: string;
    title: string;
    questions: {
        question: string;
        answers: { content: string; isCorrect: boolean }[];
    }[];
};

const RESULTS_KEY = "quiz_results";

export default function TestScreen() {
    const params = useLocalSearchParams();
    const rawId = params.id;
    const testId = Array.isArray(rawId) ? rawId[0] : String(rawId);

    const [test, setTest] = useState<AppTest | null>(null);
    const [loading, setLoading] = useState(true);

    const [blocked, setBlocked] = useState(false);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);

    // reset po wejściu w inny test
    useEffect(() => {
        setBlocked(false);
        setIndex(0);
        setScore(0);
    }, [testId]);

    // GET szczegóły testu
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const data = await getTestDetails(testId);

                setTest({
                    id: data.id,
                    title: data.name,
                    questions: Array.isArray(data.tasks)
                        ? _.shuffle(data.tasks).map((t) => ({
                            question: t.question,
                            answers: _.shuffle(t.answers),
                        }))
                        : [],
                });
            } catch (e) {
                const message = e instanceof Error ? e.message : "Brak internetu";
                Alert.alert("Błąd", message);
                setTest(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [testId]);

    // blokada (lokalnie)
    useEffect(() => {
        const check = async () => {
            try {
                const stored = await AsyncStorage.getItem(RESULTS_KEY);
                if (!stored) return;

                const parsed = JSON.parse(stored);
                const arr = Array.isArray(parsed) ? parsed : [];
                const done = arr.find((r: any) => String(r.testId) === testId);

                if (done) setBlocked(true);
            } catch {
                setBlocked(false);
            }
        };

        check();
    }, [testId]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#783cff" />
                <Text style={{ color: "#cfcfcf", marginTop: 12 }}>Ładuję test...</Text>
            </View>
        );
    }

    if (!test) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Test o ID {testId} nie istnieje.</Text>
            </View>
        );
    }

    if (blocked) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Ten test został już ukończony.</Text>
                <TouchableOpacity style={styles.answer} onPress={() => router.push("/")}>
                    <Text style={styles.answerText}>Wróć</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!test.questions[index]) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Błąd danych testu – brak pytania {index + 1}.</Text>
            </View>
        );
    }

    const current = test.questions[index];

    const handleAnswer = async (isCorrect: boolean) => {
        const newScore = score + (isCorrect ? 1 : 0);
        setScore(newScore);

        const isLastQuestion = index + 1 >= test.questions.length;

        if (!isLastQuestion) {
            setIndex((prev) => prev + 1);
            return;
        }

        const payload = {
            nick: "Jan",
            score: newScore,
            total: test.questions.length,
            type: test.title,
        };

        try {
            const response = await fetch("https://tgryl.pl/quiz/result", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.log("Błąd serwera:", errText);
                throw new Error(`Błąd HTTP: ${response.status}`);
            }

            // zapis do blokady (po sukcesie POST)
            const stored = await AsyncStorage.getItem(RESULTS_KEY);
            let arr: any[] = [];
            try {
                arr = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(arr)) arr = [];
            } catch {
                arr = [];
            }

            arr.push({ testId: test.id });
            await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(arr));
            setBlocked(true);

            router.push("/results");
        } catch (error) {
            console.error("Błąd wysyłania wyniku:", error);

            const msg =
                error instanceof TypeError
                    ? "Nie udało się wysłać wyników – brak internetu lub problem z siecią."
                    : "Nie udało się wysłać wyników na serwer.";

            Alert.alert("Błąd", msg);
        }

    };

    return (
        <View style={styles.container}>
            <Text style={styles.question}>
                Pytanie {index + 1}/{test.questions.length}
            </Text>
            <Text style={styles.title}>{current.question}</Text>

            {current.answers.map((a: any, idx: number) => (
                <TouchableOpacity key={idx} style={styles.answer} onPress={() => handleAnswer(a.isCorrect)}>
                    <Text style={styles.answerText}>{a.content}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1d",
        padding: 20,
        justifyContent: "center",
    },
    question: {
        color: "#b38aff",
        fontSize: 18,
        marginBottom: 10,
    },
    title: {
        color: "#e6e6e6",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    answer: {
        backgroundColor: "#26262b",
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.3)",
    },
    answerText: {
        color: "#e6e6e6",
        fontSize: 18,
    },
});
