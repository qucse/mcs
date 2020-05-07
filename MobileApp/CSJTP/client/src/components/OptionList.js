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
					backgroundColor: '#dde0dd'
				}}
			>
				<Text style={{ fontWeight: '600' }}> Itinerary #{item.number}</Text>
				{expanded ? (
					<Icon style={{ fontSize: 18 }} type="AntDesign" name="upcircle" />
				) : (
					<Icon style={{ fontSize: 18 }} type="AntDesign" name="downcircle" />
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
					<Icon style={{ fontSize: 18 }} type="AntDesign" name="upcircle" />
				) : (
					<Icon style={{ fontSize: 18 }} type="AntDesign" name="downcircle" />
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
				<Text> Estimated Time of Arrival: {item.endTime}</Text>
				<View style={{ backgroundColor: '#c5c7c5', margin: 4 }}>
					<Text> Trip Summary: </Text>
					<Text> - Number of Transfers: {item.transfers}</Text>
					<Text> - Total Duration: {item.duration}</Text>
					<Text> - Total Walking Distance: {item.walkingDistance}Km</Text>
					<Text> - Average Waiting Time: {item.waitingTime}</Text>
				</View>
				<Button
					style={{ marginTop: 4 }}
					block
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
