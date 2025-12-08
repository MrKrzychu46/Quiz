import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";


const RESULTS_KEY = "quiz_results";

type Result = {
    testId: number;
    nick: string;
    score: number;
    total: number;
    type: string;
    date: string;
};

export default function Results() {
    const [results, setResults] = useState<Result[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadResults = async (): Promise<void> => {
        const stored = await AsyncStorage.getItem(RESULTS_KEY);

        if (stored) {
            let arr: Result[] = JSON.parse(stored);

            // upewniamy się, że to tablica
            if (!Array.isArray(arr)) {
                arr = [];
            }

            // sortuj po testId
            arr.sort((a: Result, b: Result) => a.testId - b.testId);

            setResults(arr);
        } else {
            setResults([]);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadResults();
        }, [])
    );


    const onRefresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadResults();
        setRefreshing(false);
    }, []);

    const renderItem = ({ item }: { item: Result }) => (
        <View style={styles.card}>
            <Text style={styles.nick}>{item.type}</Text>
            <Text style={styles.text}>Wynik: {item.score} / {item.total}</Text>
            <Text style={styles.date}>Data: {item.date}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={results}
                keyExtractor={(item: Result, index) => `${item.testId}-${index}`}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#e6e6e6"
                        colors={["#783cff"]}
                    />
                }
                ListEmptyComponent={
                    <Text style={{ color: "#cfcfcf", textAlign: "center", marginTop: 20 }}>
                        Brak wyników – wykonaj test 🙂
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1d",
        padding: 20,
    },
    card: {
        backgroundColor: "#26262b",
        padding: 18,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.4)",
        shadowColor: "#783cff",
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    nick: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#e6e6e6",
        marginBottom: 8,
    },
    text: {
        color: "#cfcfcf",
        fontSize: 16,
    },
    date: {
        color: "#b38aff",
        marginTop: 8,
    }
});
