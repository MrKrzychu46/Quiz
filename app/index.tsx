// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useCallback, useEffect, useState} from "react";
import { useFocusEffect } from "@react-navigation/native";


// import testów
import { tasks } from "./data/tasks";

export default function Home() {
    const [completedTests, setCompletedTests] = useState<number[]>([]);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                const stored = await AsyncStorage.getItem("quiz_results");
                if (stored) {
                    const arr = JSON.parse(stored);
                    setCompletedTests(arr.map((r: any) => r.testId));
                } else {
                    setCompletedTests([]);
                }
            };

            load();
        }, [])
    );


    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {tasks.map(test => (
                    <TestCard
                        key={test.id}
                        id={test.id}
                        title={test.title}
                        tags={["Quiz", "Test"]}
                        description={`Liczba pytań: ${test.questions.length}`}
                        completedTests={completedTests}
                    />
                ))}

                {/* STOPKA */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Get to know your ranking result</Text>
                    <TouchableOpacity
                        style={styles.footerButton}
                        onPress={() => router.push("/results")}
                    >
                        <Text style={styles.footerButtonText}>Check!</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

type TestCardProps = {
    id: number;
    title: string;
    tags: string[];
    description: string;
    completedTests: number[];
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
