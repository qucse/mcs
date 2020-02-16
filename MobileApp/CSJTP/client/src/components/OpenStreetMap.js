import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Container } from 'native-base';
import MapView, { MAP_TYPES, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 25.316089;
const LONGITUDE = 51.487437;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

function OpenStreetMapScreen() {
	const [ region, setRegion ] = useState({
		latitude: LATITUDE,
		longitude: LONGITUDE,
		latitudeDelta: LATITUDE_DELTA,
		longitudeDelta: LONGITUDE_DELTA
	});

	function mapType() {
		return this.props.provider === PROVIDER_DEFAULT ? MAP_TYPES.STANDARD : MAP_TYPES.NONE;
	}

	return (
		<Container>
			<View>
				<MapView
					region={region}
					provider={null}
					mapType={this.mapType}
					rotateEnabled={false}
					style={{ flex: 1 }}
					style={styles.map}
					showsUserLocation={true}
					showsMyLocationButton={true}
					zoomEnabled={true}
				>
					<UrlTile urlTemplate={'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'} />
				</MapView>
			</View>
		</Container>
	);
}
export default OpenStreetMapScreen;

const styles = StyleSheet.create({
	map: {
		width: 400,
		height: 800
	}
});
