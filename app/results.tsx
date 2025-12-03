import { Text, View, StyleSheet } from 'react-native';

export default function Results() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Wyniki</Text>
            <Text>Tu będą zapisane wszystkie wyniki.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a1d', // ciemne tło jak w Drawer i Home
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#e6e6e6',
        textAlign: 'center',

        textShadowColor: 'rgba(120, 60, 255, 0.6)', // neon fiolet
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 1,
    },

    text: {
        fontSize: 18,
        color: '#d1d1d1',
        textAlign: 'center',
    },

    // jeśli później dodasz listę wyników, będą gotowe style
    resultBox: {
        backgroundColor: '#26262b',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(130, 90, 255, 0.35)',
        marginBottom: 15,
        shadowColor: '#783cff',
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },

    resultText: {
        color: '#e6e6e6',
        fontSize: 16,
    },
});

