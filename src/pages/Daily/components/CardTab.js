// @flow
import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import { StyleSheet } from 'react-native';
import { Text, Page } from 'DailyScrum/src/components';
import Today from './Today';
import Yesterday from './Yesterday';
import appStyle from '../../../appStyle';
import { yesterdayTotalSelector, todayTotalSelector } from '../../../modules/cards/reducer';

class CardTab extends Component {
  props: PropsType;
  state: StateType = {
    index: 0,
    routes: [{ key: 'yesterday', title: 'Yesterday' }, { key: 'today', title: 'Today' }],
  };

  renderHeader = (props: any) =>
    <TabBar
      style={styles.headerStyle}
      indicatorStyle={styles.headerTabIndicatorStyle}
      pressOpacity={0.7}
      renderLabel={this.renderTabLabel}
      onTabPress={this.props.onTabPress}
      {...props}
    />;

  renderScene = SceneMap({
    today: () =>
      <Page noNavBar>
        <Today onScrollCards={this.props.onScrollCards} />
      </Page>,
    yesterday: () =>
      <Page noNavBar>
        <Yesterday onScrollCards={this.props.onScrollCards} />
      </Page>,
  });

  handleIndexChange = (index: number) => this.setState({ index });

  renderTabLabel = ({ route, focused }: { route: { key: string, title: string }, focused: boolean }) => {
    const { yesterdayTotal, todayTotal } = this.props;
    let title = route.title.toUpperCase();
    switch (route.key) {
      case 'yesterday':
        if (yesterdayTotal != null) {
          title += ` (${Math.round(yesterdayTotal).toLocaleString()})`;
        }
        break;
      case 'today':
        if (todayTotal != null) {
          title += ` (${Math.round(todayTotal).toLocaleString()})`;
        }
        break;
      default:
        break;
    }

    return (
      <Text style={[styles.headerTabLabelStyle, focused && styles.focusedHeaderTabLabelStyle]}>
        {title}
      </Text>
    );
  };

  render() {
    return (
      <TabViewAnimated
        style={this.props.style}
        navigationState={{
          ...this.state,
          yesterdayTotal: this.props.yesterdayTotal,
          todayTotal: this.props.todayTotal,
        }}
        renderScene={this.renderScene}
        renderHeader={this.renderHeader}
        onIndexChange={this.handleIndexChange}
        initialLayout={{
          height: 0,
          width: Dimensions.get('window').width,
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: 'white',
  },
  headerTabLabelStyle: {
    color: appStyle.colors.text,
  },
  focusedHeaderTabLabelStyle: {
    color: appStyle.colors.primary,
  },
  headerTabIndicatorStyle: {
    backgroundColor: appStyle.colors.primary,
  },
});

type PropsType = {
  yesterdayTotal: ?number,
  todayTotal: ?number,
  style?: any,
  onScrollCards: Function,
  onTabPress: Function,
};

type StateType = {
  index: number,
  routes: Array<{ key: string, title: string }>,
};

const mapStateToProps = state => ({
  yesterdayTotal: yesterdayTotalSelector(state),
  todayTotal: todayTotalSelector(state),
});

export default connect(mapStateToProps)(CardTab);