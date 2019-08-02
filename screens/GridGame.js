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
const STATUS_WAITING = 4;
const STATUS_FINISH = 5;

const BG_COLOR_NORMAL = 1;
const BG_COLOR_TOUCHING = 2;
const BG_COLOR_INCORRECT = 3;

const RATE_STEP_DURATION = 20;
const MAX_STEP_DURATION = 800;
const MIN_STEP_DURATION = 100;

const MIN_STEPS_NUMBER = 5;
const MIN_GRID = 1;
const MAX_GRID = 9;

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
		status: STATUS_START,
		timerId: '',
	};

	componentDidMount() {
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

	async setStatus(status) {
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
		this.setColor(BG_COLOR_NORMAL);
		this.enableTouchGrid(false);
	}

	async setShowingStatus() {
		this.enableTouchGrid(false);

		let timerId = setInterval(()=>{
			if (this.state.status == STATUS_SHOWING) {
				this.updateColor();
			}
		}, this.state.duration);

		this.setState({
			timerId: timerId,
		});
	}

	setAnsweringStatus() {
		this.setColor(BG_COLOR_NORMAL);
		this.enableTouchGrid(true);

		clearInterval(this.state.timerId);
	}

	setWaitingStatus() {
		this.enableTouchGrid(false);
	}

	setFinishStatus() {
		this.enableTouchGrid(false);
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
		this.setState(previousState => ({
				status: status,
			}));

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

		await this.setState({
			changeColorGridsTime: changeColorGridsTime,
		});
		console.log(this.state.changeColorGridsTime);
	}

	setAnsweringStatus() {
		console.log(this.state.changeColorGridsTime);
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
						changeColor={ this.state.changeColorGrids[i] } 
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
			this.refs[gridId].setColor(BG_COLOR_INCORRECT);
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
		console.log('setup-level');
		this.setStepDuration();
		this.setStepsNumber();
		this.setSteps();

		console.log(this.state);
	}

	setStepDuration() {
		console.log('get-duration');
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
    	console.log('get-steps-number');
    	let stepsNumber = MIN_STEPS_NUMBER;

    	if (this.state.level != 1) {
    		stepsNumber = this.state.stepsNumber + 1;
    	}

    	this.setState({
			stepsNumber: stepsNumber,
		});
    }

    setSteps() {
    	console.log('get-steps');
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