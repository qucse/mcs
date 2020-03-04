import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Button, Text } from 'native-base';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { MAP_TYPES, PROVIDER_DEFAULT, UrlTile, Polyline, Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_API_KEY = 'AIzaSyDblo66nONoE8GRW79L-rB1CHveT4EWleE';

const ASPECT_RATIO = width / height;
const LATITUDE = 25.316089;
const LONGITUDE = 51.487437;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function Map() {
	const [ region, setRegion ] = useState({
		latitude: LATITUDE,
		longitude: LONGITUDE,
		latitudeDelta: LATITUDE_DELTA,
		longitudeDelta: LONGITUDE_DELTA
	});

	const [ walkPoints, setWalkPoints ] = useState([]);
	const [ busPoints, setBusPoints ] = useState([]);
	const [ origin, setOrigin ] = useState({ latitude: LATITUDE, longitude: LONGITUDE });
	const [ destination, setDestination ] = useState({ latitude: LATITUDE, longitude: LONGITUDE });
	const [ firstDraggable, setFirstDraggable ] = useState(true);
	const [ secondDraggable, setSecondDraggable ] = useState(false);
	const [ both, setBoth ] = useState(false);

	async function getStops() {
		let url = `http://192.168.190.13:8080/otp/routers/default/plan?fromPlace=${origin.latitude}%2C${origin.longitude}&toPlace=${destination.latitude}%2C${destination.longitude}&time=1%3A32pm&date=01-30-2020&mode=TRANSIT%2CWALK&maxWalkDistance=1000000&arriveBy=false&wheelchair=false&locale=en`;
		let stops = await fetch(url);

		stops = await stops.json();
		let initialWalkPoints = [],
			initialBusPoints = [];
		let walkLegs = stops.plan.itineraries[0].legs.filter((leg) => leg.mode == 'WALK');
		for (let i = 0; i < walkLegs.length; i++) {
			initialWalkPoints.push({
				origin: {
					latitude: walkLegs[i].steps[0].lat,
					longitude: walkLegs[i].steps[0].lon
				},
				destination: {
					latitude: walkLegs[i].steps[walkLegs[i].steps.length - 1].lat,
					longitude: walkLegs[i].steps[walkLegs[i].steps.length - 1].lon
				}
			});
		}
		let busses = stops.plan.itineraries[0].legs.filter((leg) => leg.mode == 'BUS');
		busses.forEach((b) => {
			initialBusPoints.push({
				origin: {
					latitude: b.from.lat,
					longitude: b.from.lon
				},
				destination: {
					latitude: b.to.lat,
					longitude: b.to.lon
				}
			});
		});
		setBusPoints(initialBusPoints);
		setWalkPoints(initialWalkPoints);
	}

	return (
		<View>
			<MapView
				region={region}
				provider={null}
				rotateEnabled={false}
				style={{ flex: 1 }}
				style={styles.map}
				showsUserLocation={true}
			>
				{walkPoints.length > 0 &&
					walkPoints.map((point, index) => {
						return (
							<MapViewDirections
								origin={point.origin}
								destination={point.destination}
								apikey={GOOGLE_MAPS_API_KEY}
								strokeWidth={4}
								mode={'WALKING'}
								precision={'high'}
								strokeColor="grey"
								key={index}
							/>
						);
					})}
				{busPoints.length > 0 &&
					busPoints.map((b, index) => {
						return (
							<MapViewDirections
								origin={b.origin}
								destination={b.destination}
								apikey={GOOGLE_MAPS_API_KEY}
								strokeWidth={4}
								mode={'TRANSIT'}
								precision={'high'}
								strokeColor="hotpink"
								key={index}
							/>
						);
					})}
				<Marker
					draggable={firstDraggable}
					coordinate={origin}
					onDragEnd={(e) => {
						setOrigin(e.nativeEvent.coordinate);
					}}
					pinColor={'green'}
				/>
				{!firstDraggable && (
					<Marker
						draggable={secondDraggable}
						coordinate={destination}
						onDragEnd={(e) => {
							setDestination(e.nativeEvent.coordinate);
						}}
						pinColor={'orange'}
					/>
				)}
			</MapView>

			{!firstDraggable &&
			!both && (
				<Button
					rounded
					info
					style={{ position: 'absolute', bottom: '5%', right: '2%', alignSelf: 'flex-end' }}
					onPress={() => {
						setBoth(true);
					}}
				>
					<Text>Set Destination</Text>
				</Button>
			)}
			{!secondDraggable &&
			!both && (
				<Button
					style={{ position: 'absolute', bottom: '5%', left: '2%', alignSelf: 'flex-end' }}
					rounded
					info
					onPress={() => {
						setFirstDraggable(false);
						setSecondDraggable(true);
					}}
				>
					<Text>Set Origin</Text>
				</Button>
			)}
			{both && (
				<Button rounded info style={{ position: 'absolute', bottom: '5%', left: '40%' }} onPress={getStops}>
					<Text>Plan Trip</Text>
				</Button>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		width: 400,
		height: 800
	}
});
