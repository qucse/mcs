import React from 'react';
import { View } from 'react-native';
import { Root } from 'native-base';
import MapScreen from './screens/MapScreen';

export default function App() {
	return (
		<Root>
			<View>
				<MapScreen />
			</View>
		</Root>
	);
}
