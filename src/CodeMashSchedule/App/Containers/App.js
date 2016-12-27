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
        rowHasChanged: (r1, r2) => r1 !== r2
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
      .then(sessions => this.setState({
        dataSource: this.state.dataSource.cloneWithRows(sessions)
      }))
      .then(() => this.toggleLoadingIndicator())
      .catch(error => console.log(error))
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
    paddingTop: 25
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
  session: {
    padding: 10
  },
  sessionTitle: {
    color: 'darkorange',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
