import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Form, Item, Input, Icon, Text, Button, Switch } from 'native-base';
import { Slider } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function InputForm({
	destination,
	setOrigin,
	origin,
	setDate,
	date,
	setWalkingDistance,
	walkingDistance,
	setTime,
	time,
	onSubmit,
	setShow,
	setOptionsShow,
	arriveBy,
	setDestination,
	setArriveBy,
	requestCurrentLocation,
	searchModal
}) {
	const [ dateShow, setDateShow ] = useState(false);
	const [ timeShow, setTimeShow ] = useState(false);
	const { width } = Dimensions.get('window');

	function setCurrentLocation(location, func) {
		location.name = 'Latitude: ' + location.latitude.toFixed(2) + ', Longitude: ' + location.longitude.toFixed(2);
		location.location = location;
		func(location);
	}

	return (
		<View
			style={{
				height: 264,
				width: width - 1,
				backgroundColor: 'white'
			}}
		>
			<Form>
				<Item style={styles.textInput}>
					<Input
						placeholder="Origin"
						onTouchStart={() => {
							searchModal().then((place) => setOrigin(place));
						}}
						value={origin ? origin.name : null}
					/>
					<Button dark bordered style={{ marginRight: 1 }}>
						<Icon type="FontAwesome5" name="map-marked-alt" />
					</Button>
					<Button dark bordered>
						<Icon
							type="MaterialIcons"
							name="my-location"
							onPress={() => {
								requestCurrentLocation().then((location) => {
									setCurrentLocation(location, setOrigin);
								});
							}}
						/>
					</Button>
				</Item>
				<Item>
					<Input
						placeholder="Destination"
						onTouchStart={() => {
							searchModal().then((place) => setDestination(place));
						}}
						value={destination ? destination.name : ''}
					/>
					<Button dark bordered style={{ marginRight: 1 }}>
						<Icon type="FontAwesome5" name="map-marked-alt" />
					</Button>
					<Button dark bordered>
						<Icon
							type="MaterialIcons"
							name="my-location"
							onPress={() => {
								requestCurrentLocation().then((location) => {
									setCurrentLocation(location, setDestination);
								});
							}}
						/>
					</Button>
				</Item>
				<Item>
					<View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}>
						<Text>Max Walking Distance: {walkingDistance} Km</Text>
						<Slider
							thumbTintColor={'#2915d3'}
							value={walkingDistance}
							onValueChange={(value) => setWalkingDistance(value)}
							minimumValue={0}
							maximumValue={10}
							step={0.5}
						/>
					</View>
				</Item>
				<Item>
					<Input placeholder="Date" disabled value={date ? date : null} />
					<Icon
						type="FontAwesome"
						name="calendar"
						onPress={() => {
							setDateShow(true);
						}}
					/>
					{dateShow && (
						<DateTimePicker
							testID="DatePicker"
							timeZoneOffsetInMinutes={0}
							value={new Date()}
							mode={'date'}
							display={'calendar'}
							onChange={(event, returnedDate) => {
								setDateShow(Platform.OS === 'ios');
								let month = returnedDate.getMonth();
								month++;
								setDate(returnedDate.getFullYear() + '-' + month + '-' + returnedDate.getDate());
							}}
						/>
					)}
					<Text>Arrive By:</Text>
					<Switch
						thumbColor={arriveBy ? '#2915d3' : '#f4f3f4'}
						onValueChange={setArriveBy}
						value={arriveBy}
					/>
					<Input placeholder="Time" disabled value={time ? time : null} />
					<Icon
						type="Feather"
						name="clock"
						onPress={() => {
							setTimeShow(true);
						}}
					/>
					{timeShow && (
						<DateTimePicker
							testID="TimePicker"
							timeZoneOffsetInMinutes={0}
							value={new Date()}
							mode={'time'}
							display={'clock'}
							onChange={(event, returnedTime) => {
								setTimeShow(Platform.OS === 'ios');
								setTime(returnedTime.getHours() + ':' + returnedTime.getMinutes());
							}}
						/>
					)}
				</Item>
				<Button
					block
					onPress={() => {
						setShow(false);
						onSubmit();
						setOptionsShow(true);
					}}
				>
					<Text>Plan Trip</Text>
				</Button>
			</Form>
		</View>
	);
}

const styles = StyleSheet.create({});
