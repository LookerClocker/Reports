import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-data-grid/dist/react-data-grid.css';
import '../node_modules/react-data-grid/dist/react-data-grid';
import './general.css';

import LogIn from './LogIn'

export default class App extends Component {
    constructor(props){
        super(props);
        this.state={
            title: "Value Your Network. Report's back office / "
        };
    }

    componentWillMount() {
        injectTapEventPlugin();
    }

    getChildContext = () => {
        return {muiTheme: getMuiTheme(baseTheme)};
    };

    render() {
        let segment = window.location.href.split('/').pop();
        (window.location.href.split('/')[3] == 'edit_report')
            ? segment = 'edit report'
            : segment = window.location.href.split('/').pop();
        return (
            <div className="container-fluid">
                <AppBar title={this.state.title + segment} iconElementRight={<LogIn/>}/>
                {this.props.children}
            </div>
        );
    }
};

App.childContextTypes = {
    muiTheme: React.PropTypes.object
};