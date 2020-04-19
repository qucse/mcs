import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker } from 'react-native-maps';
import flagStart from '../../../assets/images/flag-start.png';
import flagEnd from '../../../assets/images/flag-end.png';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyDblo66nONoE8GRW79L-rB1CHveT4EWleE';

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function Map({ selectedItinerary, origin, destination, requestCurrentLocation }) {
	origin ? (origin = { latitude: origin.location.latitude, longitude: origin.location.longitude }) : null;
	destination
		? (destination = { latitude: destination.location.latitude, longitude: destination.location.longitude })
		: null;

	const [ region, setRegion ] = useState({
		latitude: 25.316089,
		longitude: 51.487437,
		latitudeDelta: LATITUDE_DELTA,
		longitudeDelta: LONGITUDE_DELTA
	});
	const colors = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];

	return (
		<View>
			<MapView
				initialRegion={region}
				provider={null}
				rotateEnabled={false}
				style={styles.map}
				showsUserLocation={true}
			>
				{selectedItinerary &&
					selectedItinerary.walkPoints.length > 0 &&
					selectedItinerary.walkPoints.map((walk, index) => {
						return (
							<MapViewDirections
								origin={walk.origin}
								destination={walk.destination}
								apikey={GOOGLE_MAPS_API_KEY}
								strokeWidth={4}
								mode={'WALKING'}
								precision={'high'}
								strokeColor="grey"
								key={index}
							/>
						);
					})}
				{selectedItinerary &&
					selectedItinerary.busPoints.length > 0 &&
					selectedItinerary.busPoints.map((bus, index) => {
						return (
							<MapViewDirections
								origin={bus.origin}
								destination={bus.destination}
								apikey={GOOGLE_MAPS_API_KEY}
								strokeWidth={4}
								mode={'TRANSIT'}
								precision={'high'}
								strokeColor={colors.pop()}
								key={index}
							/>
						);
					})}
				{origin && <Marker coordinate={origin} />}
				{destination && <Marker coordinate={destination} />}
			</MapView>
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		width: width,
		height: height - 20
	}
});