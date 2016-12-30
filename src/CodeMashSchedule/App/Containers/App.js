import React, { Component } from 'react'
import {
  ActivityIndicator,
  Image,
  ListView,
  Navigator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import moment from 'moment'

class SessionDetails extends Component {

  constructor(props) {
    super(props)

    this.state = {
      session: props.session
    }
  }

  render() {
    let session = this.state.session,
        sessionStartTime = new moment(session.SessionStartTime),
        sessionEndTime = new moment(session.SessionEndTime)

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={[{backgroundColor: 'darkorange', padding: 20}]}>
            <View style={{justifyContent: 'center', flexDirection: 'row', marginTop: 40}}>
            { session.Speakers.map(speaker => {
                return (
                  <View style={{flex: 1}}>
                    <Image
                      style={{borderRadius: 50, width: 100, height: 100, alignSelf: 'center'}}
                      source={{uri: 'https:' + speaker.GravatarUrl}}
                    />
                    <Text style={[{textAlign: 'center', color: 'white', marginTop: 5}]}>{speaker.FirstName} {speaker.LastName}</Text>
                  </View>
                )
              })
            }
            </View>
            <Text style={[{color: 'white', marginTop: 20, marginBottom: 10, textAlign: 'center', fontSize: 18, flex: 1, flexDirection: 'row', flexWrap: 'wrap', fontWeight: '700'}]}>
              {this.state.session.Title}
            </Text>
            <Text style={[{color: 'white', textAlign: 'center'}]}>
              {sessionStartTime.format('M.D.YYYY')}
            </Text>
            <Text style={[{color: 'white', textAlign: 'center'}]}>
              {sessionStartTime.format('h:mm A')} - {sessionEndTime.format('h:mm A')}
            </Text>
            <Text style={[{color: 'white', textAlign: 'center'}]}>
              {session.Rooms.join(', ')}
            </Text>
          </View>
          <Text style={[styles.primaryText, {paddingHorizontal: 20, paddingVertical: 15, fontSize: 16}]}>
            {this.state.session.Abstract}
          </Text>
        </ScrollView>
      </View>
    )
  }
}

class SessionsList extends Component {

  constructor(props) {
      super(props)

      this._loadSessionDetails = this._loadSessionDetails.bind(this)

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

  _formatDate = (date, format) => {
    return moment(date).format(format)
  }

  _renderRow(session) {
    let sessionStartTime = this._formatDate(session.SessionStartTime, 'M.D.YYYY, h:mm A')
    let sessionEndTime = this._formatDate(session.SessionEndTime, 'h:mm A')

    return (
      <TouchableHighlight onPress={() =>this._loadSessionDetails(session)}>
        <View style={styles.session}>
          <Text style={styles.sessionTitle}>{session.Title}</Text>
          <Text style={styles.sessionInfo}>
            When: {sessionStartTime} - {sessionEndTime}
          </Text>
          <Text style={styles.sessionInfo}>
            Where: {session.Rooms.join(', ')}
          </Text>
        </View>
      </TouchableHighlight>
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

  _loadSessionDetails(session) {
    this.props.navigator.push({
      session: session
    })
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
      .then(sessionsByDay => this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(sessionsByDay)
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
          renderRow={this._renderRow.bind(this)}
          renderSectionHeader={this._renderSectionHeader}
          renderSeparator={this._renderSeparator} />
      </View>
    );
  }

  toggleLoadingIndicator() {
    this.setState({isLoading: !this.state.isLoading})
  }
}

export default class App extends Component {

  constructor() {
    super()
  }

  render() {
    return (
      <Navigator
        initialRoute={{index: 0}}
        renderScene={this._renderScene}
        navigationBar={
          <Navigator.NavigationBar
            style={styles.navBar}
            routeMapper={{
                LeftButton: (route, navigator, index, navState) => {
                  if(index === 0) {
                    return null
                  }

                  return (
                    <TouchableOpacity
                      style={styles.navBarLeftButton}
                      onPress={() => navigator.pop()}>
                      <Text style={[styles.navBarText, styles.navBarButtonText]}>
                        {'<'}
                      </Text>
                    </TouchableOpacity>)
                },
                RightButton: (route, navigator, index, navState) => {
                  return null
                },
                Title: (route, navigator, index, navState) => {
                  return (
                    <Text style={[styles.navBarText, styles.navBarTitleText]}>
                      {route.title}
                    </Text>
                  )
                }
            }}
            />
        } />
    )
  }

  _renderScene(route, navigator) {
    if(route.index === 0) {
      route.title = 'Sessions'

      return (
        <View style={styles.container}>
          <SessionsList navigator={navigator} />
        </View>
      )
    }
    else {
      route.title = 'Session Details'

      return (
        <SessionDetails session={route.session} />
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
    paddingTop: 30,
  },
  loadingIndicator: {
    height: 75
  },
  primaryText: {
    color: 'darkorange'
  },
  rowSeparator: {
    borderColor: 'orange',
    opacity: .3,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  scene: {
    paddingTop: 30
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
    marginBottom: 5,
  },
  sessionInfo: {
    color: 'orange'
  },
  navBar: {
    backgroundColor: 'white',
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '700'
  },
  navBarTitleText: {
    color: 'darkorange',
    marginVertical: 9,
  },
  navBarLeftButton: {
    paddingLeft: 10,
  },
  navBarRightButton: {
    paddingRight: 10,
  },
  navBarButtonText: {
    color: 'darkorange',
  },
});
