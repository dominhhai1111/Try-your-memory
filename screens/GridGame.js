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
	Text,
	TouchableWithoutFeedback,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';

const STATUS_START = 1;
const STATUS_SHOWING = 2;
const STATUS_ANSWERING =3;
const STATUS_CONTINUE = 4;
const STATUS_FINISH = 5;

const BG_COLOR_NORMAL = 1;
const BG_COLOR_TOUCHING = 2;
const BG_COLOR_INCORRECT = 3;

class Grid extends Component {
	state = {
		bgColor: BG_COLOR_NORMAL,
		duration: 20,
		enableTouchGrid: false,
		bgColors: {
			[BG_COLOR_NORMAL]: 'bg_normal',
			[BG_COLOR_TOUCHING]: 'bg_touching',
			[BG_COLOR_INCORRECT]: 'bg_incorrect',
		},
		status: STATUS_SHOWING,
	};

	componentDidMount() {
		let timerId = setInterval(()=>{
			if (this.state.status == STATUS_SHOWING) {
				this.updateColor();
			}
		}, this.state.duration);
	}

	updateColor() {
		if (this.props.changeColor) {
			this.setState(previousState => (
				{
					bgColor: BG_COLOR_TOUCHING,
				}
			));
		} else {
			this.setState(previousState => (
				{
					bgColor: BG_COLOR_NORMAL,
				}
			));
		}
	}

	enableTouchGrid(enableTouchGrid) {
		this.setState(
				{
					'enableTouchGrid': enableTouchGrid
				}
			);
	}

	setColor(color) {
		if (!((this.state.status == STATUS_ANSWERING || this.state.status == STATUS_FINISH) 
			&& this.state.bgColor == BG_COLOR_INCORRECT)) {
			this.setState(previousState => (
				{
					bgColor: color,
				}
			));
		} 
	}

	setStatus(status) {
		this.setState({
			'status': status
		});

		if (status == STATUS_ANSWERING) {
			this.setColor(BG_COLOR_NORMAL);
			this.enableTouchGrid(true);
		}

		if (status == STATUS_FINISH) {
			this.enableTouchGrid(false);
		}
	}

	render() {
		const gridStyle = styles[this.state.bgColors[this.state.bgColor]];

		return (
			<TouchableHighlight 
				onPress={ () => this.props.onUpdate(this.props.gridId) } 
				disabled={ !this.state.enableTouchGrid }
				onShowUnderlay={ () => this.setColor(BG_COLOR_TOUCHING) }
				onHideUnderlay={ () => this.setColor(BG_COLOR_NORMAL) } 
			>
				<View style={[gridStyle, styles.grid]}></View>
			</TouchableHighlight>
			
		);
	}
}

export default class GridGame extends Component<Props> {
	static navigationOptions = {
		title: 'Grid Game'
	};

	constructor(props) {
	  super(props);
	
	  this.state = {
	  	stepDuration: 100,
	  	numbers: 9,
	  	stepsNumber: 16,
	  	currentNumber: 1,
	  	currentCheckedNumber: 1,
	  	steps: {
	  		1: 1, 
	  		2: 2, 
	  		3: 3, 
	  		4: 6, 
	  		5: 9, 
	  		6: 8, 
	  		7: 7, 
	  		8: 4, 
	  		9: 5,
	  		10: 4, 
	  		11: 7, 
	  		12: 8, 
	  		13: 9, 
	  		14: 6, 
	  		15: 3, 
	  		16: 2,
	  	},
	  	changeColorGrids: {
	  		1: false,
	  		2: false,
	  		3: false,
	  		4: false,
	  		5: false,
	  		6: false,
	  		7: false,
	  		8: false,
	  		9: false,
	  	},
	  	status: STATUS_SHOWING,
	  };
	}

	componentDidMount() {
		let changeColorGridsTime = setInterval(()=>{
			if (this.state.status == STATUS_SHOWING) {
				if (this.state.currentNumber > 1) {
					this.setState(previousState => ({
						changeColorGrids: Object.assign({}, previousState.changeColorGrids, {
					     	[previousState.steps[previousState.currentNumber - 1]]: false,
					    }),
					}))
				}
				if (this.state.currentNumber > this.state.stepsNumber) {
					this.setStatus(STATUS_ANSWERING);
				}
				this.setState(previousState => ({
					changeColorGrids: Object.assign({}, previousState.changeColorGrids, {
				     	[previousState.steps[previousState.currentNumber]]: true,
				    }),
					currentNumber: previousState.currentNumber + 1,
				}))
			}
		}, this.state.stepDuration);
	}

	setStatus(status) {
		this.setState(previousState => ({
				status: status,
			}));

		if (status == STATUS_ANSWERING) {
			this.setAnsweringStatus();
		}

		if (status == STATUS_FINISH) {
			this.setFinishStatus();
		}
	}

	createGrids() {
		let grids = [];

		for (let i = 1; i <= this.state.numbers; i++) {
			grids.push(
					<Grid key={ i } 
						ref={ i } 
						gridId={ i } 
						changeColor={ this.state.changeColorGrids[i] } 
						onUpdate={ this.checkCorrection.bind(this) }
					/>
				);
		}

		return grids;
	}

	checkCorrection(gridId) {
		if (gridId != this.state.steps[this.state.currentCheckedNumber]) {
			this.refs[gridId].setColor(BG_COLOR_INCORRECT);
			this.setStatus(STATUS_FINISH);
		} else {
			this.setState(previousState => ({
				'currentCheckedNumber': previousState.currentCheckedNumber + 1,
			}));
		}
	}

	setAnsweringStatus() {
		for (let i = 1; i <= this.state.numbers; i++) {
			this.refs[i].setStatus(STATUS_ANSWERING);
		}
	}

	setFinishStatus() {
		for (let i = 1; i <= this.state.numbers; i++) {
			this.refs[i].setStatus(STATUS_FINISH);
		}
	}

	render() {
		let grids = this.createGrids();

		return (
			<View style={styles.container}>
				<View style={styles.grid_area}>
					{ grids }
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
    bg_normal: {
		backgroundColor: '#17a2b8',
    },
    bg_touching: {
		backgroundColor: '#ffc107',
    },
    bg_incorrect: {
		backgroundColor: 'red',
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