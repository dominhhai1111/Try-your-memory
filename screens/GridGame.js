import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import {
	StyleSheet,
	View,
	Image,
	Button,
	Alert,
	Container,
	Row,
	Col,
	Text
} from 'react-native';

class Grid extends Component {
	state = {
		bgColor: true,
		duration: 1000,
	};

	componentDidMount() {
		let timerId = setInterval(()=>(
				this.setState(previousState => (
					{
						bgColor: !previousState.bgColor
					}
				))
			), this.state.duration);

		setTimeout(() => {
			clearInterval(timerId), this.state.duration
		});
	}

	render() {
		const gridStyle = this.state.bgColor ? styles.bg_info : styles.bg_warning;

		return (
			<View style={[gridStyle, styles.grid]}></View>
		);
	}
}

export default class GridGame extends Component<Props> {
	static navigationOptions = {
		title: 'Grid Game'
	};

	constructor(props) {
	  super(props);
	
	  this.state = {};
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.grid_area}>
					<Grid />
					<Grid />
					<Grid />
					<Grid />
					<Grid />
					<Grid />
					<Grid />
					<Grid />
					<Grid />
				</View>
			</View>
		);	
	}
}

const styles = {
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
 	grid_area: {
 		justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
  		backgroundColor: '#6c757d',
  		padding: 10,
  		flexWrap: 'wrap',
  		width: 330,
        height:330,
        margin:'auto',
    },
    bg_info: {
		backgroundColor: '#17a2b8',
    },
    bg_warning: {
		backgroundColor: '#ffc107',
    },
    bg_primary: {
		backgroundColor: '#007bff',
    },
    grid: {
    	width: 100,
    	height: 100,
        borderColor: 'black',
        borderWidth: 1,
        borderStyle: 'solid',
        position: 'relative',
    }
};