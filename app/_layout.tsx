import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';



export default function Layout() {

    return (
        <Drawer
            drawerContent={() => <CustomDrawer />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1a1a1d',
                },
                headerTintColor: '#e6e6e6',
                headerTitleStyle: {
                    fontSize: 22,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(120, 60, 255, 0.6)',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 6,
                    letterSpacing: 1,
                },
            }}
        >
            <Drawer.Screen name="index" options={{ title: "Home Page" }} />
            <Drawer.Screen name="results" options={{ title: "Results" }} />
            <Drawer.Screen name="rules" options={{ title: "Regulamin" }} />
            {/* JEDEN ekran dla wszystkich /test/1, /test/2, /test/3 */}
            <Drawer.Screen name="test/[id]" options={{ title: "Test" }} />
        </Drawer>

    );
}

function CustomDrawer() {
    return (
        <View style={styles.container}>

            {/* GÓRNA CZĘŚĆ – logo + tytuł */}
            <View style={styles.header}>

                {/* Placeholder obrazka */}
                <Image
                    source={require('../assets/images/Quiz_App_IMG.png')}
                    style={styles.logo}
                />

            </View>

            {/* PRZYCISKI: Home + Results */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
                <Text style={styles.buttonText}>Home Page</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/results')}>
                <Text style={styles.buttonText}>Results</Text>
            </TouchableOpacity>

            {/* LINIA ODDZIELAJĄCA */}
            <View style={styles.separator} />

            {/* TESTY */}
            <TouchableOpacity style={styles.button} onPress={() => router.push('/test/1')}>
                <Text style={styles.buttonText}>Test title #1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/test/2')}>
                <Text style={styles.buttonText}>Test title #2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/test/3')}>
                <Text style={styles.buttonText}>Test title #3</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1d', // ciemne tło pasujące do logo
        paddingTop: 60,
        paddingHorizontal: 10,
    },

    header: {
        alignItems: 'center',
        marginBottom: 25,
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#e6e6e6', // jasny napis
        textShadowColor: 'rgba(120, 60, 255, 0.6)', // fioletowa poświata
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 1,
    },

    logo: {
        width: 170,
        height: 170,
        resizeMode: 'contain',
        marginTop: 10,
        marginBottom: 5,
        borderRadius: 18,
        shadowColor: '#783cff', // dopasowane do motywu logo
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },

    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: '100%',
        marginVertical: 20,
    },

    /* PRZYCISKI */
    button: {
        backgroundColor: '#26262b',
        width: '90%',
        paddingVertical: 15,
        borderRadius: 10,
        alignSelf: 'center',
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(130, 90, 255, 0.4)', // fioletowy akcent
        shadowColor: '#783cff',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },

    buttonText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#e6e6e6',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
