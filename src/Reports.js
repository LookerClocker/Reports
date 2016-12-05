import React, {Component} from 'react';
import ReactDataGrid from 'react-data-grid';
import {Toolbar, Data, Filters} from 'react-data-grid/addons';
import EditLinkReport from './EditLinkReport';
import ViewLinkReport from './ViewLinkReport';

let Selectors = Data.Selectors;
let Parse = require('parse').Parse;

import './general.css';

import {Link} from 'react-router';

var columns = [
    {
        key: 'name',
        name: 'Report Title',
        sortable: true,
        filterable: true
    },
    {
        key: 'customerName',
        name: 'Customer Name',
        sortable: true,
        filterable: true
    },
    {
        key: 'startDate',
        name: 'Start date',
        sortable: true,
        filterable: true,
        width: 100
    },
    {
        key: 'endDate',
        name: 'End date',
        sortable: true,
        filterable: true,
        width: 100
    },
    {
        key: 'view',
        name: 'View',
        formatter: ViewLinkReport,
        getRowMetaData: (row) => row.id,
        width: 80
    },
    {
        key: 'edit',
        name: 'Edit',
        formatter: EditLinkReport,
        getRowMetaData: (row) => row.id,
        width: 80
    }
];

export default class Reports extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            reports: [],
            filters: {},
            sortColumn: null,
            sortDirection: null,
            height: window.innerHeight,
            test: ''
        }
    }

    // зробити перевірку, коли просто вводиш урл напряму без переходів, то якщо юзер не зареєстрований, то не показувати йому нічого

    componentDidMount() {
        let self = this;
        if (Parse.User.current()) {
            this.getReport(function (items) {
                self.setState({
                    reports: self.fillReports(items),
                    rows: self.fillReports(items)
                })
            });
        }
    };

    getReport = (callback)=> {
        let self = this;
        let query = new Parse.Query('Report');
        query.count().then(function (number) {
            query.limit(1000);
            query.skip(0);
            query.addAscending('createdAt');
            var allObj = [];

            for (var i = 0; i <= number; i += 1000) {
                query.skip(i);
                query.find().then(function (reports) {
                    allObj = allObj.concat(self.fillReports(reports));
                    self.setState({
                        reports: allObj,
                        rows: allObj,
                    });
                    callback(reports);
                });
            }
        });
    };

    fillReports = (object)=> {
        return object.map(function (item) {
            return {
                id: item.id,
                name: item.get('name'),
                token: item.get('token'),
                startDate: item.get('startDate').toISOString().substring(0, 10),
                endDate: item.get('endDate').toISOString().substring(0, 10),
                customerName: item.get('customerName')
            }
        });
    };

    // REACT DATA GRID BUILD-IN METHODS
    getRows = ()=> {
        return Selectors.getRows(this.state);
    };

    getSize = () => {
        return this.getRows().length;
    };

    rowGetter = (rowIdx)=> {
        var rows = this.getRows();
        return rows[rowIdx];
    };

    handleGridSort = (sortColumn, sortDirection)=> {
        let state = Object.assign({}, this.state, {sortColumn: sortColumn, sortDirection: sortDirection});
        this.setState(state);
    };

    handleFilterChange = (filter)=> {
        let newFilters = Object.assign({}, this.state.filters);
        if (filter.filterTerm) {
            newFilters[filter.column.key] = filter;
        } else {
            delete newFilters[filter.column.key];
        }
        this.setState({filters: newFilters});
    };

    onClearFilters = () => {
        this.setState({filters: {}});
    };

    render() {
        let checkUser;
        (Parse.User.current()) ? checkUser = (
            <div>
                <div className="row">
                    <strong className="total">Total reports: {this.getSize()}</strong>
                    <div className="col-md-2 col-md-offset-9 col-xs-12">
                        <Link to='/new_report'>
                            <button className="btn btn-default add-butt">Add report</button>
                        </Link>
                    </div>
                </div>
                <ReactDataGrid
                    idProperty='id'
                    onGridSort={this.handleGridSort}
                    columns={columns}
                    rowGetter={this.rowGetter}
                    rowsCount={this.getSize()}
                    minHeight={this.state.height}
                    toolbar={<Toolbar enableFilter={true}/>}
                    onAddFilter={this.handleFilterChange}
                    onClearFilters={this.onClearFilters}/>
            </div>
        ) : '';
        return (
            <div>
                {checkUser}
            </div>
        )
    }
}