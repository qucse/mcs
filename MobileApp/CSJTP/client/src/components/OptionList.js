import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, Accordion, Icon, Button } from 'native-base';
const { width, height } = Dimensions.get('window');

export default function OptionList({ data, setSelectedItinerary, setOptionsShow }) {
	function renderHeaderFirst(item, expanded) {
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
				<Text style={{ fontWeight: '600' }}> Itinerary #{item.number}</Text>
				{expanded ? (
					<Icon style={{ fontSize: 18 }} name="remove-circle" />
				) : (
					<Icon style={{ fontSize: 18 }} name="add-circle" />
				)}
			</View>
		);
	}

	function renderHeaderSecond(item, expanded) {
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
					<Text style={{ fontWeight: '600' }}>Walk for {item.distance}Km</Text>
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

	function renderContentFirst(item) {
		return (
			<View style={{ backgroundColor: 'white' }}>
				<Text> Start: {item.startTime}</Text>
				<Accordion
					dataArray={item.legs}
					animation={true}
					renderHeader={renderHeaderSecond}
					renderContent={renderContentSecond}
				/>
				<Text> End: {item.endTime}</Text>
				<View style={{ backgroundColor: 'lightgray', margin: 4 }}>
					<Text> Trip Summary: </Text>
					<Text> - Number of Transfers: {item.transfers}</Text>
					<Text> - Total Duration: {item.duration}</Text>
					<Text> - Total Walking Distance: {item.walkingDistance}Km</Text>
					<Text> - Total Waiting Time: {item.waitingTime}</Text>
				</View>
				<Button
					style={{ marginTop: 4 }}
					warning
					onPress={() => {
						setSelectedItinerary(item);
						setOptionsShow(false);
					}}
				>
					<Text>Select This Itinerary</Text>
				</Button>
			</View>
		);
	}

	function renderContentSecond(item) {
		return (
			<View style={{ backgroundColor: 'white' }}>
				{item.legType == 'WALK' ? (
					<View>
						<Text> - Start Time: {item.startTime}</Text>
						{item.steps.map((step, index) => {
							return (
								<Text key={index}>
									- head {step.heading} to {step.to} for {step.for}Km
								</Text>
							);
						})}
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
		<Accordion
			style={styles.accordion}
			dataArray={data}
			animation={true}
			expanded={0}
			renderHeader={renderHeaderFirst}
			renderContent={renderContentFirst}
		/>
	);
}
const styles = StyleSheet.create({
	accordion: {
		height: height,
		width: width
	}
});
