"use babel";

var ipc = require('ipc')
var _ = require('lodash')
var cx = require('classnames')
var key = require('keymaster')

var React = require('react')
var Tabs = require('react-simpletabs')
var PlaybackBar = require('./player/PlaybackBar.jsx')
var Playlist = require('./playlist/Playlist.jsx')
var Sidebar = require('./Sidebar/Sidebar.jsx')
var Footer = require('./Footer.jsx')

var OpenPlaylistStore = require('../stores/OpenPlaylistStore')
var SidebarStore = require('../stores/SidebarStore')

var OpenPlaylistActions = require('../actions/OpenPlaylistActions')
var PlayerActions = require('../actions/PlayerActions')

function getSidebarState(){
  return SidebarStore.getSidebarInfo()
}

function getOpenPlaylistState(){
  return {
    openPlaylists: OpenPlaylistStore.getAll(),
    selectedPlaylist: OpenPlaylistStore.getSelectedPlaylist(),
    selectedIndex: OpenPlaylistStore.getSelectedIndex()
  }
}

module.exports = React.createClass({
  getInitialState: function() {
    return _.merge({ sidebar: getSidebarState() }, getOpenPlaylistState())
  },
  componentDidMount: function() {
    OpenPlaylistStore.addChangeListener(this._onOpenPlaylistChange)
    SidebarStore.addChangeListener(this._onSidebarChange)
    key('space', this.handleSpacePress)
  },
  componentWillUnmount: function() {
    OpenPlaylistStore.removeChangeListener(this._onOpenPlaylistChange)
    SidebarStore.removeChangeListener(this._onSidebarChange)
    key.unbind('space')
  },
  handleAfter: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    OpenPlaylistActions.select(selectedIndex-1)
  },
  render: function() {
    var openPlaylists = this.state.openPlaylists.map((playlist)=>{
      return (
        <Tabs.Panel title={playlist.title} key={playlist.id}>
          <Playlist playlist={playlist} isSidebarOpen={this.state.sidebar.isOpen}/>
        </Tabs.Panel>
      )
    })
    var classes = cx({
      'playa-main' : true,
      'sidebar-open' : this.state.sidebar.isOpen
    })
    return (
      <div className={classes}>
        <PlaybackBar/>
        <Sidebar {...this.state.sidebar}/>
        <div className="playa-main-wrapper">
          <Tabs
            tabActive={this.state.selectedIndex+1}
            onAfterChange={this.handleAfter}>
            {openPlaylists}
          </Tabs>
        </div>
        <Footer selectedPlaylist={this.state.selectedPlaylist} />
      </div>
    )
  },
  handleSpacePress: function(event){
    PlayerActions.toggle()
  },
  _onOpenPlaylistChange: function() {
    this.setState(getOpenPlaylistState())
  },
  _onSidebarChange: function(){
    this.setState({ sidebar: getSidebarState()})
  }
})
