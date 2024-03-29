import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import {
	Animated,
	View,
	Text,
	TouchableOpacity,
	TouchableHighlight,
} from 'react-native';
import { Font } from 'expo';

const STATUS_START = 1;
const STATUS_SHOWING = 2;
const STATUS_ANSWERING = 3;
const STATUS_WAITING = 4;
const STATUS_FINISH = 5;

const RATE_STEP_DURATION = 50;
const MAX_STEP_DURATION = 1600;
const MIN_STEP_DURATION = 800;

const MIN_STEPS_NUMBER = 5;
const MIN_GRID = 1;
const MAX_GRID = 9;

const COLOR_NORMAL = '#17a2b8';
const COLOR_TOUCHING = '#ffc107';
const COLOR_INCORRECT = '#ff0000';
const COLOR_GRAY = '#6c757d';

const ANIMATE_GRID_DURATION = 800;
const ANIMATE_VALUE_NORMAL_BEGIN = 0;
const ANIMATE_VALUE_NORMAL_END = 400;
const ANIMATE_VALUE_TOUCHING = 200;
const ANIMATE_VALUE_INCORRECT = -1;

const NOTICE_WIN = 1;
const NOTICE_LOSE = 2;

const ANIMATE_NOTICE_DURATION = 1000;
const ANIMATE_NOTICE_MIN_VALUE = 10;
const ANIMATE_NOTICE_MAX_VALUE = 50;
const ANIMATE_NOTICE_OFF_TIMEOUT = 1000;

const ANIMATE_BORDER_DURATION = 1000;
const ANIMATE_BORDER_ONE = 0;
const ANIMATE_BORDER_TWO = 200;
const ANIMATE_BORDER_THREE = 400;

class Notice extends Component {
	state = {
		message: '',
		fontLoaded: false,
		animateFontSizeValue: new Animated.Value(ANIMATE_NOTICE_MIN_VALUE),
		isShowed: false,
		noticeColor: '',
	};

	noticeText = {
		[NOTICE_WIN]: 'Correct',
		[NOTICE_LOSE]: 'Incorrect',
	}

	noticeColor = {
		[NOTICE_WIN]: 'yellow',
		[NOTICE_LOSE]: 'red',
	}

	constructor() {
		super();
		this.hideNotice = this.hideNotice.bind(this);
	}

	componentDidMount() {
		Font.loadAsync({
			'ballo-chettan': require('../assets/fonts/BalooChettan-Regular.ttf'),
			'bree-serif': require('../assets/fonts/BalooChettan-Regular.ttf'),
		}).then( () => this.setState({ 'fontLoaded': true }) );
	}

	animateNotice(notice) {
		Animated.timing(this.state.animateFontSizeValue, {
			'toValue': ANIMATE_NOTICE_MAX_VALUE,
			'duration': ANIMATE_NOTICE_DURATION,
		}).start(() => setTimeout(() => this.hideNotice(notice), ANIMATE_NOTICE_OFF_TIMEOUT));
	}

	showNotice(notice) {
		this.setState({
			isShowed: true,
			message: this.noticeText[notice],
			noticeColor: this.noticeColor[notice],
		});
		
		this.animateNotice(notice);
	}

	hideNotice(notice) {
		this.setState({
			isShowed: false,
			animateFontSizeValue: new Animated.Value(ANIMATE_NOTICE_MIN_VALUE),
		});

		if (notice == NOTICE_WIN) {
			this.props.continue();
		}
	}

	render() {
		const animateFontSizeStyle = {
			'fontSize': this.state.animateFontSizeValue,
		};

		const noticeColorStyle = {
			'color': this.state.noticeColor,
		}

		return(
			this.state.isShowed ? (
				<View style = { styles.notice }>
					{
						this.state.fontLoaded ? (
							<Animated.Text style = { [styles.notice_text, animateFontSizeStyle, noticeColorStyle] }>{ this.state.message }</Animated.Text>
						) : null
					}
				</View>
			) : null
		);
	}
}

class Grid extends Component {
	state = {
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
		if (this.state.status != STATUS_FINISH || color == ANIMATE_VALUE_INCORRECT) {
			this.setState({
				animatedColor: new Animated.Value(color),
			});
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
		this.setColor(ANIMATE_VALUE_NORMAL_BEGIN);
		this.enableTouchGrid(false);
	}

	async setShowingStatus() {
		this.setColor(ANIMATE_VALUE_NORMAL_BEGIN);
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
			showedNotice: false,
			animatedBorderColor: new Animated.Value(ANIMATE_BORDER_ONE),
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
			this.continue();
		}

		if (this.state.status == STATUS_FINISH) {
			this.continue();
		}
	}

	setBtnControl(status) {
		this.setState({
			btnControlText: this.btnControlText[status],
		});
	}

	async setStatus(status) {
		await this.setState({
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
		this.setUpLevel();
	}

	async setShowingStatus() {
		this.animateBorder();

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
		this.animateBorder();
		clearInterval(this.state.changeColorGridsTime);
	}

	setWaitingStatus() {
		this.showNotice(NOTICE_WIN);
	}

	setFinishStatus() {
		this.showNotice(NOTICE_LOSE);
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
		await this.setUpLevel();
		await this.setStatus(STATUS_SHOWING);
	}

	async setUpLevel() {
		let level = 0;
		if (this.state.status != STATUS_FINISH && this.state.status != STATUS_START) {
			level = this.state.level + 1;
		} else {
			level = 1;
		}
		console.log(level);
		await this.setState({
			'level': level,
			'currentNumber': 1,
			'currentCheckedNumber': 0,
		});

		this.setStepDuration();
		this.setStepsNumber();
		this.setSteps();
	}

	setStepDuration() {
		let stepDuration = MAX_STEP_DURATION - RATE_STEP_DURATION * this.state.level;
		stepDuration = stepDuration > MIN_STEP_DURATION ? stepDuration : MIN_STEP_DURATION;

		this.setState({
			stepDuration: stepDuration,
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

	showNotice(notice) {
		this.refs.notice.showNotice(notice);
	}

	animateBorder() {
		Animated.timing(this.state.animatedBorderColor, {
			toValue: ANIMATE_BORDER_THREE,
			duration: ANIMATE_BORDER_DURATION,
		}).start(() => { this.setState({ animatedBorderColor: new Animated.Value(ANIMATE_BORDER_ONE) }) });
	}

	render() {
		let grids = this.createGrids();
		const interpolatedBorderColor = this.state.animatedBorderColor.interpolate({
			inputRange: [ ANIMATE_BORDER_ONE, ANIMATE_BORDER_TWO, ANIMATE_BORDER_THREE ],
			outputRange: [ COLOR_GRAY, COLOR_TOUCHING, COLOR_GRAY ],
		});
		const animatedBorderStyle = {
			backgroundColor: interpolatedBorderColor,
		};

		return (
			<View style = {styles.container}>
				<Notice ref = "notice" continue = { this.continue.bind(this) }/>
				<View style = { styles.score_area_bound }>
					<View style = { styles.score_area }>
						<Text style = { styles.level }>Level: { this. state.level }</Text>
						<Text style = { styles.step }>Step: { this.state.currentCheckedNumber }/{ this.state.stepsNumber }</Text>
					</View>
				</View>
				
				<View style = { styles.grid_area_bound }>
					<Animated.View style={ [styles.grid_area, animatedBorderStyle] }>
						{ grids }
					</Animated.View>
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
		position: 'relative',
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
  		// backgroundColor: '#6c757d',
  		flexWrap: 'wrap',
  		width: '90%',
        aspectRatio: 1 / 1,
        margin:'auto',
    },
    grid: {
    	width: '30%',
    	aspectRatio: 1 / 1,
        borderColor: 'black',
        borderWidth: 1,
        borderStyle: 'solid',
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
		alignItems: 'center',
		justifyContent: 'center',
		height: '20%',
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
	notice: {
		zIndex: 2,
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	notice_text: {
		fontFamily: 'ballo-chettan',
	}
};