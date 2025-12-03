import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TestScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Test #{id}</Text>

            <View style={styles.box}>
                <Text style={styles.text}>Tu będzie logika quizu</Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a1d', // ciemne tło jak reszta
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#e6e6e6',
        textAlign: 'center',

        textShadowColor: 'rgba(120, 60, 255, 0.6)', // fioletowy glow
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
        letterSpacing: 1,
    },

    // BOX NA TREŚĆ QUIZU
    box: {
        backgroundColor: '#26262b',
        padding: 20,
        borderRadius: 12,

        borderWidth: 1,
        borderColor: 'rgba(130, 90, 255, 0.35)', // neonowa ramka

        shadowColor: '#783cff',
        shadowOpacity: 0.25,
        shadowRadius: 10,
    },

    text: {
        fontSize: 18,
        color: '#d1d1d1',
        lineHeight: 24,
    },
});
