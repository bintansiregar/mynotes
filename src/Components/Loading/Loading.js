import React from 'react'
import { ActivityIndicator, Appearance, StyleSheet, Text, View } from 'react-native'

export default function Loading({ loadingMessage, visible }) {
    return (
        <View style={{
            ...styles.loadingContainer,
            display: visible ? 'flex' : 'none',
            backgroundColor: Appearance.getColorScheme() === "dark" ? '#000' : '#fff'
        }}>
            <ActivityIndicator size="large" color="#00ff00" style={{marginBottom: 15}} />
            <Text style={{
                textAlign: 'center',
                color: Appearance.getColorScheme() === "dark" ? '#fff' : '#000'
            }}>{loadingMessage}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
	loadingContainer: {
		display: 'none',
		justifyContent: 'center',
		height: '100%',
		width: '100%',
	}
});
