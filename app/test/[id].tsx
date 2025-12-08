import { useLocalSearchParams, router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

export default function Test() {
    const { id } = useLocalSearchParams<{ id: string }>();



    return (
        <View style={styles.container}>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#1a1a1d", padding: 20 },
    counter: { color: "#aaa", marginBottom: 10 },
    question: {
        color: "#fff",
        fontSize: 20,
        marginBottom: 30,
        fontWeight: "bold"
    },
    button: {
        backgroundColor: "#26262b",
        borderWidth: 1,
        borderColor: "rgba(130,90,255,0.4)",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    answer: { color: "white", fontSize: 16 },
});
