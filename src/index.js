import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Router from 'react-router/lib/Router';
import { browserHistory } from 'react-router';
import Route from 'react-router/lib/Route';
import Reports from './Reports'
import ViewReport from './ViewReport'
import AddReport from './AddReport';

let Parse = require('parse').Parse;
let parseApplicationId = 'VYN-BO';
let parseJavaScriptKey = 'js-key';
let parseMasterKey = 'PZ/Fc_YwK:d5[Szp';

Parse.serverURL = "http://api.valueyournetwork.com/parse";
Parse.initialize(parseApplicationId, parseJavaScriptKey, parseMasterKey);

ReactDOM.render(
    <Router history={ browserHistory }>
        <Route path='/' component={ App }>
            <Route path='/' component={ App }/>
            <Route path='reports' component={Reports}/>
            <Route path='new_report' component={ AddReport }/>
            <Route path='edit_report/:id' component={ AddReport }/>
            <Route path='view_report/:id' component={ViewReport}/>
        </Route>

    </Router>,
  document.getElementById('root')
);
