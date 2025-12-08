import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tasks } from "../data/tasks";

const RESULTS_KEY = "quiz_results";

export default function TestScreen() {
    const { id } = useLocalSearchParams();
    const numericId = Number(id);

    const test = tasks.find(t => t.id === numericId);

    const [blocked, setBlocked] = useState(false);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setBlocked(false); // reset blokady przy zmianie ID
    }, [numericId]);

    // 🔐 sprawdzenie czy ten test był już robiony
    useEffect(() => {
        const check = async () => {
            const stored = await AsyncStorage.getItem(RESULTS_KEY);
            if (stored) {
                const arr = JSON.parse(stored);
                const done = arr.find((r: any) => r.testId === numericId);
                if (done) setBlocked(true);
            }
        };
        check();
    }, [numericId]);

    // 🔄 reset indeksu i wyniku po wejściu w test
    useEffect(() => {
        setIndex(0);
        setScore(0);
    }, [numericId]);

    if (!test) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Test o ID {id} nie istnieje.</Text>
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
                <Text style={styles.title}>
                    Błąd danych testu – brak pytania {index + 1}.
                </Text>
            </View>
        );
    }

    const current = test.questions[index];

    const handleAnswer = async (isCorrect: boolean) => {
        const newScore = score + (isCorrect ? 1 : 0);
        setScore(newScore);

        const isLastQuestion = index + 1 >= test.questions.length;

        if (isLastQuestion) {
            const result = {
                testId: test.id,
                nick: "User",
                score: newScore,
                total: test.questions.length,
                type: test.title,
                date: new Date().toISOString().slice(0, 10),
            };

            // 🔥 zawsze bierzemy AKTUALNĄ tablicę wyników
            const stored = await AsyncStorage.getItem(RESULTS_KEY);
            let resultsArray = stored ? JSON.parse(stored) : [];

            // dopisz nowy wynik (nie usuwamy żadnego)
            resultsArray.push(result);

            await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(resultsArray));

            router.push("/results");
        } else {
            setIndex(prev => prev + 1);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.question}>Pytanie {index + 1}/{test.questions.length}</Text>
            <Text style={styles.title}>{current.question}</Text>

            {current.answers.map((a: any, idx: number) => (
                <TouchableOpacity
                    key={idx}
                    style={styles.answer}
                    onPress={() => handleAnswer(a.isCorrect)}
                >
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
        justifyContent: "center"
    },
    question: {
        color: "#b38aff",
        fontSize: 18,
        marginBottom: 10
    },
    title: {
        color: "#e6e6e6",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
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
        fontSize: 18
    }
});
