import React, { Component } from 'react'
import {
  ActivityIndicator,
  ListView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class App extends Component {

  constructor() {
      super()

      const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      })

      this.state = {
        dataSource: ds
      }
  }

  componentDidMount() {
    this.loadSessions()
  }

  _renderRow(session) {
    return (
      <View style={styles.session}>
        <Text style={styles.sessionTitle}>{session.Title}</Text>
      </View>
    )
  }

  _renderSectionHeader(sectionData, sectionID) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Day {sectionID}</Text>
      </View>
    )
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    let key = sectionID + ":" + rowID

    return (
      <View
        style={styles.rowSeparator}
        key={key} />
    )
  }

  loadSessions() {
    this.toggleLoadingIndicator()

    fetch('https://speakers.codemash.org/api/SessionsData')
      .then(response => response.json())
      .then(sessions => {
        return sessions.reduce((sessionsByDay, session) => {
          let sessionStartTime = new Date(session.SessionStartTime)
          let day = sessionStartTime.getDate() - 9
          let sessions = sessionsByDay[day] || []

          sessions.push(session)
          sessionsByDay[day] = sessions

          return sessionsByDay
        }, {})
      })
      .then(sessions => this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(sessions)
      }))
      .then(() => this.toggleLoadingIndicator())
      .catch(error => {
        console.log(error)
        throw error
      })
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.isLoading &&
        <ActivityIndicator
          color='darkorange'
          style={styles.loadingIndicator}
          animating={this.state.isLoading} />
        }
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          renderSeparator={this._renderSeparator} />
      </View>
    );
  }

  toggleLoadingIndicator() {
    this.setState({isLoading: !this.state.isLoading})
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
    paddingTop: 25,
  },
  loadingIndicator: {
    height: 80
  },
  rowSeparator: {
    borderColor: 'orange',
    opacity: .3,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  sectionHeader: {
    backgroundColor: 'darkorange',
    padding: 5,
  },
  sectionHeaderText: {
    color: '#F5FCFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  session: {
    padding: 10
  },
  sessionTitle: {
    color: 'darkorange',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
