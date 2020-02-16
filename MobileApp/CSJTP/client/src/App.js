import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import GetLocation from 'react-native-get-location';
import OpenStreetMap from './components/OpenStreetMap';

export default function App() {
	const [ location, setLocation ] = useState();

	_requestLocation = () => {
		setLocation(null);

		GetLocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout: 150000
		})
			.then(async (location) => {
				setLocation(location);
				// await fetch(`http://10.20.32.29:1504/api/geoinfo`, {
				// 	method: 'POST',
				// 	headers: {
				// 		'Content-Type': 'application/json'
				// 	},
				// 	body: JSON.stringify(location)
				// });
			})
			.catch((ex) => {
				const { code, message } = ex;
				console.warn(code, message);
				if (code === 'CANCELLED') {
					Alert.alert('Location cancelled by user or by another request');
				}
				if (code === 'UNAVAILABLE') {
					Alert.alert('Location service is disabled or unavailable');
				}
				if (code === 'TIMEOUT') {
					Alert.alert('Location request timed out');
				}
				if (code === 'UNAUTHORIZED') {
					Alert.alert('Authorization denied');
				}
				setLocation(null);
			});
	};

	useEffect(() => {
		_requestLocation();
	}, []);

	return (
		<View style={styles.container}>
			<OpenStreetMap />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF'
	},
	location: {
		color: '#333333',
		marginBottom: 5
	}
});
