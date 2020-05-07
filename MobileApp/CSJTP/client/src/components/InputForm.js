/**
 * - @file:  
 * - @description:  
 * 
 * - @author: Abdelmonem Mohamed
 */

import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Form, Item, Input, Icon, Text, Button, Switch, Toast, Picker } from 'native-base';
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
	searchModal,
	setDestinationDragMarker,
	setOriginDragMarker,
	originDragMarker,
	destinationDragMarker
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
							searchModal().then((place) => {
								if (place) setOrigin(place);
							});
						}}
						value={origin ? origin.name : null}
					/>
					<Button
						dark
						transparent
						style={{ marginRight: 1 }}
						onPress={() => {
							setOriginDragMarker(!originDragMarker);
							if (!originDragMarker) {
								Toast.show({
									text: 'Please Set The Location on The Map',
									buttonText: 'Okay',
									duration: 3000
								});
							}
						}}
					>
						<Icon type="FontAwesome5" name="map-marked-alt" />
					</Button>
					<Button dark transparent>
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
							searchModal().then((place) => {
								if (place) setDestination(place);
							});
						}}
						value={destination ? destination.name : ''}
					/>
					<Button
						dark
						transparent
						style={{ marginRight: 1 }}
						onPress={() => {
							setDestinationDragMarker(!destinationDragMarker);
							if (!destinationDragMarker) {
								Toast.show({
									text: 'Please Set The Location on The Map',
									buttonText: 'Okay',
									duration: 3000
								});
							}
						}}
					>
						<Icon type="FontAwesome5" name="map-marked-alt" />
					</Button>
					<Button dark transparent>
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
						<Text style={{ marginTop: 3 }}>Max Walking Distance: {walkingDistance} Km</Text>
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
					<Picker
						mode="dropdown"
						iosIcon={<Icon name="arrow-down" />}
						style={{ width: 33 }}
						placeholderStyle={{ color: '#bfc6ea' }}
						placeholderIconColor="#007aff"
						selectedValue={arriveBy}
						onValueChange={(value) => {
							setArriveBy(value);
						}}
					>
						<Picker.Item label="Start By" value={false} />
						<Picker.Item label="Arrive By" value={true} />
					</Picker>

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
