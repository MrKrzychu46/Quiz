// app/welcome.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Welcome() {
    const handleAccept = async () => {
        await AsyncStorage.setItem("alreadyLaunched", "true");
        router.replace("/");
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />

            <View style={styles.container}>
                <Text style={styles.title}>Witamy w aplikacji Quiz!</Text>

                <Text style={styles.text}>
                    Oto regulamin korzystania z aplikacji. Kliknij „Akceptuję”, aby przejść dalej.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAccept}
                >
                    <Text style={styles.buttonText}>AKCEPTUJĘ</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#1a1a1d",
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 25,
        color: "#e6e6e6",
        textAlign: "center",
        textShadowColor: "rgba(120, 60, 255, 0.6)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 1,
    },

    text: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 40,
        color: "#cfcfcf",
        lineHeight: 22,
    },

    button: {
        backgroundColor: "#26262b",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.4)",
        shadowColor: "#783cff",
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },

    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6e6e6",
    },
});
