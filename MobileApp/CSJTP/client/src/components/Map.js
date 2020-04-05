import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Modal } from 'react-native';
import { Button, Text, Accordion, Icon } from 'native-base';
import MapViewDirections from 'react-native-maps-directions';
import MapView, { Marker } from 'react-native-maps';

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

	const [ origin, setOrigin ] = useState({ latitude: LATITUDE, longitude: LONGITUDE });
	const [ destination, setDestination ] = useState({ latitude: LATITUDE, longitude: LONGITUDE });
	const [ firstDraggable, setFirstDraggable ] = useState(true);
	const [ secondDraggable, setSecondDraggable ] = useState(false);
	const [ itineraries, setItineraries ] = useState([]);
	const [ both, setBoth ] = useState(false);
	const [ modal, setModal ] = useState(false);
	const [ selectedItinerary, setSelectedItinerary ] = useState(null);
	const [ selectAgain, setSelectAgain ] = useState(false);
	const toKm = 1000;
	const colors = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];
	let colors2 = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];

	async function getStops() {
		let url = `http://192.168.1.110:8080/otp/routers/default/plan?fromPlace=${origin.latitude}%2C${origin.longitude}&toPlace=${destination.latitude}%2C${destination.longitude}&time=1%3A32pm&date=01-30-2020&mode=TRANSIT%2CWALK&maxWalkDistance=1000000&arriveBy=false&wheelchair=false&locale=en`;
		let stops = await fetch(url);

		stops = await stops.json();
		let initialItineraries = [];
		stops.plan.itineraries.forEach((itinerary, i) => {
			setBoth(false);
			let transfers = itinerary.transfers;
			let duration = secondsToTime(itinerary.duration);
			let waitingTime = (itinerary.waitingTime / 60).toFixed(2);
			let walkingDistance = (itinerary.walkDistance / toKm).toFixed(2);
			let walkPoints = [],
				busPoints = [];
			let description = '';
			let number = ++i;
			let startTime = msDateToTime(itinerary.startTime);
			let endTime = msDateToTime(itinerary.endTime);
			let legs = [];
			itinerary.legs.forEach((element, index) => {
				if (element.mode == 'WALK') {
					let from = element.from.name;
					let distance = (element.distance / toKm).toFixed(2);
					let to = element.to.name;
					let startTime = msDateToTime(element.startTime);
					let endTime = msDateToTime(element.endTime);
					let legType = element.mode;
					legs.push({ from, distance, to, startTime, endTime, legType, color: 'grey' });
					description += `-${++index}- WALK from ${from} for ${distance}Km to ${to}\n`;
				} else if (element.mode == 'BUS') {
					let title = element.agencyName + ', ' + element.route + ', ' + element.headsign;
					let busNo = element.route;
					let busAgency = element.agencyName;
					let busName = element.headsign;
					let from = element.from.name;
					let to = element.to.name;
					let legType = element.mode;
					let duration = secondsToTime(element.duration);
					let startTime = msDateToTime(element.startTime);
					let endTime = msDateToTime(element.endTime);
					legs.push({
						from,
						duration,
						to,
						startTime,
						endTime,
						legType,
						duration,
						busAgency,
						busName,
						busNo,
						color: colors2.pop()
					});
					description += `-${++index}- Take BUS ${title} from ${from} to ${to}\n`;
				}
			});
			colors2 = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];
			let walkLegs = itinerary.legs.filter((leg) => leg.mode == 'WALK');
			for (let i = 0; i < walkLegs.length; i++) {
				walkPoints.push({
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
			let busLegs = itinerary.legs.filter((leg) => leg.mode == 'BUS');
			busLegs.forEach((bus) => {
				busPoints.push({
					origin: {
						latitude: bus.from.lat,
						longitude: bus.from.lon
					},
					destination: {
						latitude: bus.to.lat,
						longitude: bus.to.lon
					}
				});
			});
			description.trim();
			initialItineraries.push({
				transfers,
				waitingTime,
				walkingDistance,
				busPoints,
				walkPoints,
				description,
				number,
				legs,
				startTime,
				endTime,
				duration
			});
		});

		setItineraries(initialItineraries);
		setModal(true);
	}

	function onSelect() {
		setModal(true);
		setSelectAgain(false);
	}

	function onSelectTrip(item) {
		setModal(false);
		setSelectedItinerary(item);
		setSelectAgain(true);
	}

	function msDateToTime(ms) {
		const date = new Date(ms);
		return date.getHours() + ':' + date.getMinutes();
	}

	function secondsToTime(sec_num) {
		var hours = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - hours * 3600) / 60);
		var seconds = sec_num - hours * 3600 - minutes * 60;

		if (hours < 10) {
			hours = '0' + hours;
		}
		if (minutes < 10) {
			minutes = '0' + minutes;
		}
		if (seconds < 10) {
			seconds = '0' + seconds;
		}
		return hours + ':' + minutes;
	}

	function _renderHeaderFirst(item, expanded) {
		return (
			<View
				style={{
					flexDirection: 'row',
					padding: 10,
					justifyContent: 'space-between',
					alignItems: 'center',
					backgroundColor: '#A9DAD6'
				}}
			>
				<Text style={{ fontWeight: '600' }}> Trip #{item.number}</Text>
				{expanded ? (
					<Icon style={{ fontSize: 18 }} name="remove-circle" />
				) : (
					<Icon style={{ fontSize: 18 }} name="add-circle" />
				)}
			</View>
		);
	}

	function _renderHeaderSecond(item, expanded) {
		return (
			<View
				style={{
					flexDirection: 'row',
					padding: 10,
					justifyContent: 'space-between',
					alignItems: 'center',
					backgroundColor: item.color
				}}
			>
				{item.legType == 'WALK' ? (
					<Text style={{ fontWeight: '600' }}>WALK for {item.distance}Km</Text>
				) : (
					<Text style={{ fontWeight: '600' }}>Take Bus No. {item.busNo}</Text>
				)}
				{expanded ? (
					<Icon style={{ fontSize: 18 }} name="remove-circle" />
				) : (
					<Icon style={{ fontSize: 18 }} name="add-circle" />
				)}
			</View>
		);
	}

	function _renderContentFirst(item) {
		return (
			<View>
				<Text> Start: {item.startTime}</Text>
				<Accordion
					dataArray={item.legs}
					animation={true}
					renderHeader={_renderHeaderSecond}
					renderContent={_renderContentSecond}
				/>
				<Text> End: {item.endTime}</Text>
				<View style={{ backgroundColor: 'lightgray', margin: 4 }}>
					<Text> Trip Summary: </Text>
					<Text> - Number of Transfers: {item.transfers}</Text>
					<Text> - Total Duration: {item.duration}</Text>
					<Text> - Total Walking Distance: {item.distance}Km</Text>
					<Text> - Total Waiting Time: {item.waitingTime}</Text>
				</View>
				<Button
					style={{ marginTop: 4 }}
					warning
					onPress={() => {
						onSelectTrip(item);
					}}
				>
					<Text>Select This Trip</Text>
				</Button>
			</View>
		);
	}

	function _renderContentSecond(item) {
		return (
			<View>
				{item.legType == 'WALK' ? (
					<View>
						<Text> - Start Time: {item.startTime}</Text>
						<Text> - Walk From {item.from}</Text>
						<Text> - For {item.distance}Km</Text>
						<Text> - To {item.to}</Text>
						<Text> - End Time: {item.endTime}</Text>
					</View>
				) : (
					<View>
						<Text> - Start Time: {item.startTime}</Text>
						<Text> - Board at {item.from}</Text>
						<Text> - Time In Transit {item.duration}</Text>
						<Text> - Alight at {item.to}</Text>
						<Text> - End Time: {item.endTime}</Text>
					</View>
				)}
			</View>
		);
	}

	return (
		<View>
			<MapView
				initialRegion={region}
				provider={null}
				rotateEnabled={false}
				style={{ flex: 1 }}
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
			{itineraries.length > 0 && (
				<Modal animationType="slide" transparent={true} visible={modal}>
					<View style={styles.modalView}>
						<Accordion
							dataArray={itineraries}
							animation={true}
							expanded={0}
							renderHeader={_renderHeaderFirst}
							renderContent={_renderContentFirst}
						/>
					</View>
				</Modal>
			)}
			{firstDraggable &&
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
			{secondDraggable &&
			!both && (
				<Button
					rounded
					info
					style={{ position: 'absolute', bottom: '5%', right: '2%', alignSelf: 'flex-end' }}
					onPress={() => {
						setBoth(true);
						setSecondDraggable(false);
					}}
				>
					<Text>Set Destination</Text>
				</Button>
			)}
			{both && (
				<Button rounded info style={{ position: 'absolute', bottom: '5%', left: '40%' }} onPress={getStops}>
					<Text>Plan Trip</Text>
				</Button>
			)}
			{selectAgain && (
				<Button rounded info style={{ position: 'absolute', bottom: '5%', left: '40%' }} onPress={onSelect}>
					<Text>Show Trips</Text>
				</Button>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	map: {
		width: 400,
		height: 800
	},
	modalView: {
		backgroundColor: 'white',
		borderRadius: 20,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5
	}
});
