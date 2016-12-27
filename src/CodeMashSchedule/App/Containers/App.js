import React, { Component } from 'react'
import {
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

      const sessions = [
        {Title: 'Happy'}, {Title: 'Sail'}
      ]

      this.state = {
        dataSource: ds.cloneWithRows(sessions)
      }
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

  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator} />
      </View>
    );
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
