import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import GetLocation from 'react-native-get-location';
import { Fab, Button, Icon, Toast } from 'native-base';
import InputForm from '../components/InputForm';
import Map from '../components/Map';
import RNGooglePlaces from 'react-native-google-places';
import OptionList from '../components/OptionList';

export default function MapScreen() {
	const [ location, setLocation ] = useState();
	const [ origin, setOrigin ] = useState(null);
	const [ destination, setDestination ] = useState(null);
	const [ date, setDate ] = useState();
	const [ walkingDistance, setWalkingDistance ] = useState(0);
	const [ time, setTime ] = useState();
	const [ formShow, setFormShow ] = useState(false);
	const [ itineraries, setItineraries ] = useState([]);
	const [ optionsShow, setOptionsShow ] = useState(false);
	const [ selectedItinerary, setSelectedItinerary ] = useState();
	const [ arriveBy, setArriveBy ] = useState(false);
	const toKm = 1000;
	let colors = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];

	function requestCurrentLocation() {
		return GetLocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout: 150000
		})
			.then(async (location) => {
				return location;
			})
			.catch((ex) => {
				return null;
			});
	}

	function openSearchModal() {
		return RNGooglePlaces.openAutocompleteModal({
			country: 'QA'
		})
			.then((place) => {
				return place;
			})
			.catch((error) => error);
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

	async function getStops() {
		if (origin && destination && date && time) {
			let url = `http://192.168.100.5:8080/otp/routers/default/plan?fromPlace=${origin.location
					.latitude}%2C${origin.location.longitude}&toPlace=${destination.location.latitude}%2C${destination
					.location
					.longitude}&time=${time}&date=${date}&mode=TRANSIT%2CWALK&maxWalkDistance=${walkingDistance *
					1000}&arriveBy=${arriveBy}&wheelchair=false&locale=en`,
				stops = await fetch(url),
				initialItineraries = [];
			stops = await stops.json();
			if (stops.error) {
				setFormShow(true);
				Toast.show({
					text: stops.error.msg,
					buttonText: 'Okay',
					duration: 10000,
					type: 'danger'
				});
				setItineraries([]);
			} else {
				stops.plan.itineraries.forEach((itinerary, i) => {
					let transfers = itinerary.transfers,
						duration = secondsToTime(itinerary.duration),
						waitingTime = (itinerary.waitingTime / 60).toFixed(2),
						walkingDistance = (itinerary.walkDistance / toKm).toFixed(2),
						walkPoints = [],
						busPoints = [],
						number = ++i,
						startTime = msDateToTime(itinerary.startTime),
						endTime = msDateToTime(itinerary.endTime),
						legs = [];

					itinerary.legs.forEach((element, index) => {
						if (element.mode == 'WALK') {
							let from = element.from.name,
								distance = (element.distance / toKm).toFixed(2),
								to = element.to.name,
								startTime = msDateToTime(element.startTime),
								endTime = msDateToTime(element.endTime),
								legType = element.mode,
								steps = [];
							element.steps.forEach((step) => {
								steps.push({
									go: step.relativeDirection,
									to: step.streetName,
									heading: step.absoluteDirection,
									for: (step.distance / toKm).toFixed(2)
								});
							});
							legs.push({ from, distance, steps, to, startTime, endTime, legType, color: 'grey' });
						} else if (element.mode == 'BUS') {
							let busNo = element.route,
								busAgency = element.agencyName,
								busName = element.headsign,
								from = element.from.name,
								to = element.to.name,
								legType = element.mode,
								duration = secondsToTime(element.duration),
								startTime = msDateToTime(element.startTime),
								endTime = msDateToTime(element.endTime);
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
								color: colors.pop()
							});
						}
					});
					colors = [ 'yellow', 'violet', 'hotpink', 'purple', 'green', 'orange', 'blue', 'red' ];
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
					initialItineraries.push({
						transfers,
						waitingTime,
						walkingDistance,
						busPoints,
						walkPoints,
						number,
						legs,
						startTime,
						endTime,
						duration
					});
				});
				setItineraries(initialItineraries);
			}
		} else {
			Toast.show({
				text: 'Please Make Sure To Input All The Required Data',
				buttonText: 'Okay',
				duration: 4000,
				type: 'danger'
			});
			setFormShow(true);
		}
	}

	return (
		<View>
			<View>
				<Map
					selectedItinerary={selectedItinerary}
					origin={origin}
					destination={destination}
					requestCurrentLocation={requestCurrentLocation}
				/>
			</View>
			<View
				style={{
					position: 'absolute'
				}}
			>
				{formShow && (
					<InputForm
						searchModal={openSearchModal}
						origin={origin}
						setOrigin={setOrigin}
						setDestination={setDestination}
						destination={destination}
						setDate={setDate}
						date={date}
						setTime={setTime}
						time={time}
						walkingDistance={walkingDistance}
						setWalkingDistance={setWalkingDistance}
						setShow={setFormShow}
						onSubmit={getStops}
						setOptionsShow={setOptionsShow}
						arriveBy={arriveBy}
						setArriveBy={setArriveBy}
						requestCurrentLocation={requestCurrentLocation}
					/>
				)}
				{optionsShow && (
					<OptionList
						data={itineraries}
						setSelectedItinerary={setSelectedItinerary}
						setOptionsShow={setOptionsShow}
					/>
				)}
			</View>
			<Fab
				active={true}
				style={{ backgroundColor: '#2915d3' }}
				position="bottomRight"
				onPress={() => {
					setFormShow(!formShow);
				}}
			>
				<Icon type="MaterialCommunityIcons" name="bus-clock" />
			</Fab>
		</View>
	);
}
