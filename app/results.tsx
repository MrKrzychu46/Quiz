// app/results.tsx
import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

type ApiResult = {
    id?: string;          // czasem API ma id; jeśli nie ma, użyjemy fallbacku
    nick: string;
    score: number;
    total: number;
    type: string;
    createdOn?: string;   // często spotykane
    date?: string;        // albo takie pole
};

const RESULTS_URL = "https://tgryl.pl/quiz/results?last=20";

export default function Results() {
    const [results, setResults] = useState<ApiResult[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const normalizeDate = (item: ApiResult) => item.createdOn ?? item.date ?? "";

    const loadResults = async (): Promise<void> => {
        try {
            setErrorMsg(null);

            const res = await fetch(RESULTS_URL, {
                method: "GET",
                headers: { Accept: "application/json" },
            });

            if (!res.ok) {
                throw new Error(`Błąd HTTP: ${res.status}`);
            }

            const data = await res.json();

            // API powinno zwrócić tablicę; zabezpieczenie:
            const arr: ApiResult[] = Array.isArray(data) ? data : [];

            // (opcjonalnie) sortuj od najnowszego jeśli data istnieje
            arr.sort((a, b) => {
                const ta = new Date(normalizeDate(a)).getTime();
                const tb = new Date(normalizeDate(b)).getTime();
                // jeśli brak daty, niech zostanie kolejność z API
                if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
                return tb - ta;
            });

            setResults(arr);
        } catch (e: any) {
            setErrorMsg(e?.message ?? "Nie udało się pobrać wyników");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadResults();
        }, [])
    );

    const onRefresh = useCallback(async (): Promise<void> => {
        setRefreshing(true);
        await loadResults();
        setRefreshing(false);
    }, []);

    const renderItem = ({ item }: { item: ApiResult }) => (
        <View style={styles.card}>
            <Text style={styles.nick}>{item.type}</Text>
            <Text style={styles.text}>Nick: {item.nick}</Text>
            <Text style={styles.text}>
                Wynik: {item.score} / {item.total}
            </Text>
            {!!normalizeDate(item) && (
                <Text style={styles.date}>Data: {normalizeDate(item)}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <ActivityIndicator size="large" color="#783cff" />
                <Text style={{ color: "#cfcfcf", textAlign: "center", marginTop: 12 }}>
                    Pobieram wyniki...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {errorMsg && (
                <Text style={{ color: "#ff8a8a", marginBottom: 12, textAlign: "center" }}>
                    {errorMsg}
                </Text>
            )}

            <FlatList
                data={results}
                keyExtractor={(item, index) =>
                    item.id ? String(item.id) : `${item.nick}-${item.type}-${normalizeDate(item)}-${index}`
                }
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
                        Brak wyników do wyświetlenia 🙂
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
    },
});
