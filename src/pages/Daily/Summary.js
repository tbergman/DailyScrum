// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Page, BigButton, createErrorBar, Modal, LottieAnimation } from 'DailyScrum/src/components';
import { SprintGoalCard } from './components';
import { fetchBaseData } from 'DailyScrum/src/modules/common';
import { currentSprintSelector } from '../../modules/sprints/reducer';
import { currentProjectSelector } from '../../modules/projects/reducer';
import { yesterdayTotalSelector, todayTotalSelector } from '../../modules/cards/reducer';
import type { SprintType, ProjectType } from '../../types';
import LeadCard from './components/LeadCard';
import PointsLeftCard from './components/PointsLeftCard';
import TipCard from '../../components/TipCard';
import { getTipIfNotReadSelector } from '../../modules/tips/reducer';
import { format } from 'date-fns';
import { getLastWorkableDayTime } from '../../services/Time';

const ErrorBar = createErrorBar({ common: 'base' });

class Summary extends Component {
  props: PropsType;
  state: StateType = { showTip: false };

  componentDidMount() {
    this.props.fetchBaseData();
  }

  goToCardPage = pageName => {
    if (this.props.tip) {
      this.setState({
        showTip: true,
      });
    }

    this.props.navigation.navigate(pageName);
  };

  render() {
    const lastWorkableDayTime = getLastWorkableDayTime();
    const { currentSprint, currentProject } = this.props;
    if (!currentSprint || !currentProject) return <Page isLoading />;
    return (
      <Page>
        <ErrorBar />
        {currentSprint.pointsLeft != null &&
          currentSprint.pointsLeft <= 0 &&
          <View style={styles.pointsLeftAnimationContainer}>
            <LottieAnimation source={require('../../../assets/lottie/colorline.json')} />
          </View>}
        {!!this.props.tip &&
          <Modal visible={this.state.showTip} onRequestClose={() => this.setState({ showTip: false })}>
            <View style={styles.tipContainer}>
              <TipCard tip={this.props.tip} />
            </View>
          </Modal>}
        <View style={styles.container}>
          <View style={styles.infos}>
            <Animatable.View animation="fadeIn" delay={200} style={styles.sprintGoal}>
              <SprintGoalCard title={currentSprint.goal} />
            </Animatable.View>
            {currentSprint.lead != null &&
              <Animatable.View animation="fadeInLeft">
                <LeadCard lead={currentSprint.lead} />
              </Animatable.View>}
            {currentSprint.pointsLeft != null &&
              <Animatable.View animation="fadeInRight">
                <PointsLeftCard pointsLeft={currentSprint.pointsLeft} />
              </Animatable.View>}
          </View>
          <View style={styles.buttons}>
            <BigButton
              style={[styles.button, { marginRight: 4 }]}
              icon={{ name: 'chevron-left' }}
              title={`${format(lastWorkableDayTime, 'ddd')}. (${Math.round(
                this.props.yesterdayTotal
              ).toLocaleString()})`}
              onPress={() => this.goToCardPage('yesterday')}
            />
            <BigButton
              style={[styles.button, { marginLeft: 4 }]}
              icon={{ name: 'chevron-right', right: true }}
              title={`Today (${Math.round(this.props.todayTotal).toLocaleString()})`}
              onPress={() => this.goToCardPage('today')}
            />
          </View>
        </View>
      </Page>
    );
  }
}

type PropsType = {
  navigation: any,
  login: Function,
  fetchBaseData: Function,
  currentSprint: ?SprintType,
  currentProject: ?ProjectType,
  yesterdayTotal: number,
  todayTotal: number,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sprintGoal: {
    marginBottom: 20,
    width: 0.75 * Dimensions.get('window').width,
  },
  infos: {
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    marginTop: 10,
  },
  tipContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  pointsLeftAnimationContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        top: 150, // iOS lottie positioning is buggy
      },
      android: {
        justifyContent: 'center', // normal behaviour
      },
    }),
  },
});

type StateType = {
  showTip: boolean,
};

const mapStateToProps = state => ({
  currentSprint: currentSprintSelector(state),
  currentProject: currentProjectSelector(state),
  yesterdayTotal: yesterdayTotalSelector(state),
  todayTotal: todayTotalSelector(state),
  tip: getTipIfNotReadSelector(state, 'DAILY_SUMMARY'),
});

const mapDispatchToProps = {
  fetchBaseData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
