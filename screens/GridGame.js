import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import {
	Animated,
	View,
	Text,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';

const STATUS_START = 1;
const STATUS_SHOWING = 2;
const STATUS_ANSWERING = 3;
const STATUS_WAITING = 4;
const STATUS_FINISH = 5;

const BG_COLOR_NORMAL = 1;
const BG_COLOR_TOUCHING = 2;
const BG_COLOR_INCORRECT = 3;

const RATE_STEP_DURATION = 20;
const MAX_STEP_DURATION = 2000;
const MIN_STEP_DURATION = 500;

const MIN_STEPS_NUMBER = 5;
const MIN_GRID = 1;
const MAX_GRID = 9;

const COLOR_NORMAL = '#17a2b8';
const COLOR_TOUCHING = '#ffc107';
const COLOR_INCORRECT = '#ff0000';

const ANIMATE_GRID_DURATION = 1000;
const ANIMATE_VALUE_NORMAL_BEGIN = 0;
const ANIMATE_VALUE_NORMAL_END = 400;
const ANIMATE_VALUE_TOUCHING = 200;
const ANIMATE_VALUE_INCORRECT = -1;

class Grid extends Component {
	state = {
		bgColor: BG_COLOR_NORMAL,
		duration: 20,
		enableTouchGrid: false,
		status: STATUS_START,
		animatedColor: new Animated.Value(ANIMATE_VALUE_NORMAL_BEGIN),
	};

	componentDidMount() {
	}

	animateGrid() {
		this.setState({
			animatedColor: new Animated.Value(ANIMATE_VALUE_NORMAL_BEGIN),
		});
		Animated.timing(this.state.animatedColor, {
			toValue: ANIMATE_VALUE_NORMAL_END,
			duration: ANIMATE_GRID_DURATION,
		}).start();
	}

	enableTouchGrid(enableTouchGrid) {
		this.setState(
				{
					'enableTouchGrid': enableTouchGrid
				}
			);
	}

	setColor(color) {
		console.log('grid-color: ' + color);
		if (this.state.status != STATUS_FINISH || color == ANIMATE_VALUE_INCORRECT) {
			console.log('grid-status: ' + this.state.status);
			this.setState({
				animatedColor: new Animated.Value(color),
			});
		} 
	}

	async setStatus(status) {
		console.log(status);
		await this.setState({
			'status': status
		});

		if (status == STATUS_START) {
			this.setStartStatus();
		}

		if (status == STATUS_SHOWING) {
			this.setShowingStatus();
		}

		if (status == STATUS_ANSWERING) {
			this.setAnsweringStatus();
		}

		if (status == STATUS_WAITING) {
			this.setWaitingStatus();
		}

		if (status == STATUS_FINISH) {
			this.setFinishStatus();
		}
	}

	setStartStatus() {
		this.setColor(ANIMATE_VALUE_NORMAL_BEGIN);
		this.enableTouchGrid(false);
	}

	async setShowingStatus() {
		this.enableTouchGrid(false);
	}

	setAnsweringStatus() {
		this.setColor(ANIMATE_VALUE_NORMAL_BEGIN);
		this.enableTouchGrid(true);
	}

	setWaitingStatus() {
		this.enableTouchGrid(false);
	}

	setFinishStatus() {
		this.enableTouchGrid(false);
	}

	render() {
		const interpolatedColor = this.state.animatedColor.interpolate({
			inputRange: [
				ANIMATE_VALUE_INCORRECT, 
				ANIMATE_VALUE_NORMAL_BEGIN, 
				(ANIMATE_VALUE_NORMAL_BEGIN + ANIMATE_VALUE_TOUCHING) / 2,
				ANIMATE_VALUE_TOUCHING, 
				(ANIMATE_VALUE_TOUCHING + ANIMATE_VALUE_NORMAL_END) / 2, 
				ANIMATE_VALUE_NORMAL_END
			],
			outputRange: [
				COLOR_INCORRECT,
				COLOR_NORMAL, 
				COLOR_TOUCHING, 
				COLOR_TOUCHING, 
				COLOR_TOUCHING,
				COLOR_NORMAL],
		});
		const animatedStyle = {
			backgroundColor: interpolatedColor,
		};

		return (
			<TouchableHighlight 
				onPress={ () => this.props.onUpdate(this.props.gridId) } 
				disabled={ !this.state.enableTouchGrid }
				onShowUnderlay={ () => this.setColor(ANIMATE_VALUE_TOUCHING) }
				onHideUnderlay={ () => this.setColor(ANIMATE_VALUE_NORMAL_BEGIN) } 
			>
				<Animated.View style={[styles.grid, animatedStyle]}></Animated.View>
			</TouchableHighlight>
			
		);
	}
}

export default class GridGame extends Component {
	static navigationOptions = {
		title: 'Grid Game'
	};

	constructor(props) {
	  super(props);
	
	  this.state = {
	  	level: 1,
	  	stepDuration: 100,
	  	numbers: 9,
	  	stepsNumber: 16,
	  	currentNumber: 1,
	  	currentCheckedNumber: 0,
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
	  	status: STATUS_SHOWING,
		btnControlText: '',
		changeColorGridsTime: '',
		test: 0,
	  };

	  this.btnControlText = {
	  	[STATUS_START]: 'Start',
	  	[STATUS_SHOWING]: 'Showing',
	  	[STATUS_ANSWERING]: 'Answering',
	  	[STATUS_WAITING]: 'Continue',
	  	[STATUS_FINISH]: 'Restart',
	  };
	}

	componentDidMount() {
		this.setStatus(STATUS_START);
	}

	async onPressBtnControl() {
		if (this.state.status == STATUS_START) {
			this.setStatus(STATUS_SHOWING);
		}

		if (this.state.status == STATUS_WAITING) {
			await this.continue();
			this.setStatus(STATUS_SHOWING)
		}

		if (this.state.status == STATUS_FINISH) {
			await this.start();
			this.setStatus(STATUS_START);
		}
	}

	setBtnControl(status) {
		this.setState({
			btnControlText: this.btnControlText[status],
		});
	}

	setStatus(status) {
		this.setState({
				status: status,
			});

		for (let i = 1; i <= this.state.numbers; i++) {
			this.refs[i].setStatus(status);
		}

		this.setBtnControl(status);

		if (status == STATUS_START) {
			this.setStartStatus();
		}

		if (status == STATUS_SHOWING) {
			this.setShowingStatus();
		}

		if (status == STATUS_ANSWERING) {
			this.setAnsweringStatus();
		}

		if (status == STATUS_WAITING) {
			this.setWaitingStatus();
		}

		if (status == STATUS_FINISH) {
			this.setFinishStatus();
		}
	}

	setStartStatus() {
		this.start();
	}

	async setShowingStatus() {
		let changeColorGridsTime = setInterval(()=>{
			if (this.state.status == STATUS_SHOWING) {
				if (this.state.currentNumber > this.state.stepsNumber) {
					this.setStatus(STATUS_ANSWERING);
				} else {
					this.refs[this.state.steps[this.state.currentNumber]].animateGrid();
					this.setState(previousState => ({
						currentNumber: previousState.currentNumber + 1,
					}))
				}
			}
		}, this.state.stepDuration);

		await this.setState({
			changeColorGridsTime: changeColorGridsTime,
		});
	}

	setAnsweringStatus() {
		clearInterval(this.state.changeColorGridsTime);
	}

	setWaitingStatus() {
	}

	setFinishStatus() {
	}

	createGrids() {
		let grids = [];

		for (let i = 1; i <= this.state.numbers; i++) {
			grids.push(
					<Grid key={ i } 
						ref={ i } 
						gridId={ i } 
						onUpdate={ this.checkCorrection.bind(this) }
					/>
				);
		}

		return grids;
	}

	async checkCorrection(gridId) {
		await this.setState(previousState => ({
				'currentCheckedNumber': previousState.currentCheckedNumber + 1,
			}));

		if (gridId != this.state.steps[this.state.currentCheckedNumber]) {
			this.refs[gridId].setColor(ANIMATE_VALUE_INCORRECT);
			this.setStatus(STATUS_FINISH);
		} else {
			if (this.state.currentCheckedNumber == this.state.stepsNumber) {
				this.setStatus(STATUS_WAITING);
			}
		}
	}

	async continue() {
		await this.setState(previousState => ({
				'level': previousState.level + 1,
				'currentNumber': 1,
				'currentCheckedNumber': 0,
			}));

		this.setUpLevel();
	}

	async start() {
		await this.setState(previousState => ({
				'level': 1,
				'currentNumber': 1,
				'currentCheckedNumber': 0,
			}));

		await this.setUpLevel();
	}

	async setUpLevel() {
		this.setStepDuration();
		this.setStepsNumber();
		this.setSteps();
	}

	setStepDuration() {
		let rate = 0;
		let levelRate = parseInt(this.state.level / 2);
		switch (levelRate) {
			case 1: rate = 0; break;
			case 2: rate = 1; break;
			case 3: rate = 2; break;
			case 4: rate = 3; break;
			case 5: rate = 4; break;
			case 6: rate = 5; break;
			default: rate = 5; break;
		}

		this.setState({
			stepDuration: MAX_STEP_DURATION - RATE_STEP_DURATION * rate,
		});
    }

    setStepsNumber() {
    	let stepsNumber = MIN_STEPS_NUMBER;

    	if (this.state.level != 1) {
    		stepsNumber = this.state.stepsNumber + 1;
    	}

    	this.setState({
			stepsNumber: stepsNumber,
		});
    }

    setSteps() {
		let steps = {};
        
        for (let i = 1; i <= this.state.stepsNumber; i++) {
        	steps[i] = MIN_GRID + Math.floor(Math.random() * (MAX_GRID - MIN_GRID));
		}

		this.setState({
			steps: steps,
		});
	}

	render() {
		let grids = this.createGrids();

		return (
			<View style={styles.container}>
				<View style = { styles.score_area_bound }>
					<View style = { styles.score_area }>
						<Text style = { styles.level }>Level: { this. state.level }</Text>
						<Text style = { styles.step }>Step: { this.state.currentCheckedNumber }/{ this.state.stepsNumber }</Text>
					</View>
				</View>
				
				<View style = { styles.grid_area_bound }>
					<View style={styles.grid_area}>
						{ grids }
					</View>
				</View>
				
				<View style = { styles.btn_area_bound}>
					<TouchableOpacity
						style = { styles.btn_control }
						onPress = { this.onPressBtnControl.bind(this) }
					>
						<Text style = { styles.btn_control_text }>{ this.state.btnControlText }</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = {
	container: {
		width: '100%',
		height: '100%',
	},
    score_area_bound: {
    	alignItems: 'center',
    	justifyContent: 'center',
    	height: '10%',
    	width: '100%',
    },
    score_area: {
    	flexDirection: 'row',
    	justifyContent: 'space-between',
    	width: '90%',
    },
    grid_area_bound: {
    	alignItems: 'center',
    	justifyContent: 'center',
    	width: '100%',
    	height: '70%',
    },
    grid_area: {
 		justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
  		backgroundColor: '#6c757d',
  		// padding: 10,
  		flexWrap: 'wrap',
  		width: '90%',
        aspectRatio: 1 / 1,
        margin:'auto',
    },
    grid: {
    	width: '30%',
    	// height: 100,
    	aspectRatio: 1 / 1,
        borderColor: 'black',
        borderWidth: 1,
        borderStyle: 'solid',
        // position: 'relative',
    },
    level: {
    	fontSize: 20,
    	fontWeight: 'bold',
    },
    step: {
    	fontSize: 20,
    	fontWeight: 'bold',
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
    btn_area_bound: {
    	marginTop: 30,
    	alignItems: 'center',
    },
    btn_control: {
    	paddingTop: 10,
    	paddingBottom: 10,
    	paddingLeft: 20,
    	paddingRight: 20,
    	backgroundColor: 'yellow',
    	borderColor: 'red',
    	borderWidth: 3,
    	borderStyle: 'solid',
    	borderRadius: 10,
    },
    btn_control_text: {
		fontSize: 20,
    	fontWeight: 'bold', 
    },
};