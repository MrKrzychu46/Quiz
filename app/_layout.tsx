// app/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 IMPORT TESTÓW
import { tasks } from "./data/tasks";

export default function Layout() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const checkLaunch = async () => {
            try {
                const launched = await AsyncStorage.getItem("alreadyLaunched");

                if (!launched) {
                    // bezpieczniejsze wywołanie replace po wyrenderowaniu
                    requestAnimationFrame(() => {
                        router.replace("/welcome");
                    });
                }
            } catch (e) {
                console.error("Launch check error:", e);
            } finally {
                setReady(true);
            }
        };

        checkLaunch();
    }, []);

    if (!ready) {
        return (
            <View style={{ flex: 1, backgroundColor: "#1a1a1d", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: "white" }}>Loading...</Text>
            </View>
        );
    }

    return (
        <Drawer
            drawerContent={() => <CustomDrawer />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#1a1a1d",
                },
                headerTintColor: "#e6e6e6",
                headerTitleStyle: {
                    fontSize: 22,
                    fontWeight: "bold",
                    textShadowColor: "rgba(120, 60, 255, 0.6)",
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 6,
                    letterSpacing: 1,
                },
            }}
        >
            <Drawer.Screen name="index" options={{ title: "Home Page" }} />
            <Drawer.Screen name="results" options={{ title: "Results" }} />
            <Drawer.Screen
                name="test/[id]"
                options={{ title: "Test" }}
                dangerouslySingular
            />
            {/* ekran powitalny nie musi być w Drawerze, obsługujemy go router.replace */}
        </Drawer>
    );
}

function CustomDrawer() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require("../assets/images/Quiz_App_IMG.png")}
                    style={styles.logo}
                />
            </View>

            {/* Przyciski stałe */}
            <TouchableOpacity style={styles.button} onPress={() => router.push("/")}>
                <Text style={styles.buttonText}>Home Page</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push("/results")}>
                <Text style={styles.buttonText}>Results</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* 🔥 AUTOMATYCZNE GENEROWANIE PRZYCISKÓW TESTÓW */}
            {tasks.map(test => (
                <TouchableOpacity
                    key={test.id}
                    style={styles.button}
                    onPress={() => router.push(`/test/${test.id}`)}
                >
                    <Text style={styles.buttonText}>{test.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1d",
        paddingTop: 60,
        paddingHorizontal: 10,
    },
    header: {
        alignItems: "center",
        marginBottom: 25,
    },
    logo: {
        width: 170,
        height: 170,
        resizeMode: "contain",
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 18,
        shadowColor: "#783cff",
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    separator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
        width: "100%",
        marginVertical: 20,
    },
    button: {
        backgroundColor: "#26262b",
        width: "90%",
        paddingVertical: 15,
        borderRadius: 10,
        alignSelf: "center",
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(130, 90, 255, 0.4)",
        shadowColor: "#783cff",
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonText: {
        textAlign: "center",
        fontSize: 18,
        color: "#e6e6e6",
        fontWeight: "600",
    },
});
