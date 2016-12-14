import React, {Component} from 'react';
let Parse = require('parse').Parse;
import {LineChart} from 'react-d3-basic';

let LineTooltip = require('react-d3-tooltip').LineTooltip;

let clickGraphDetect;

export default class ViewReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            logo: '',
            startDate: '',
            endDate: '',
            customerName: '',
            campaigns: [],
            allScreen: [],
            facebookId: [],
            twitterId: [],
            twitterReach: '',
            facebookReach: '',
            budget: '',
            cpcMax: '',
            campaignsId: [],
            validatedClick: [],
            array: [],
            uniqueUser: [],
            fbClicks: [],
            twClicks: [],
            fbUsers: [],
            days: [],
            clicks: 'all',
            showFacebook: true,
            showTwitter: true,
            allScreens: true,
            participant: [],
            participantsInfo: []

        }
    }

    componentDidMount() {
        let self = this;
        if (this.props.params.id) {
            this.getReport(function (item) {
                self.setState({
                    name: item.get('name'),
                    logo: item.get('logo')._url,
                    startDate: item.get('startDate').toISOString().substring(0, 10),
                    endDate: item.get('endDate').toISOString().substring(0, 10),
                    customerName: item.get('customerName'),
                    campaigns: item.get('campaign').map(function (camp) {
                        return camp.get('ParentCampaign');
                    }),
                    campaignsId: item.get('campaign').map(function (camp) {
                        return camp.id;
                    }),
                    facebookId: item.get('facebookScreenshot') ? item.get('facebookScreenshot').map(function (elem) {
                        return elem.id;
                    }) : '',
                    twitterId: item.get('twitterScreenshot') ? item.get('twitterScreenshot').map(function (elem) {
                        return elem.id;
                    }) : '',
                    twitterReach: item.get('reachTwitter') ? item.get('reachTwitter') : '',
                    facebookReach: item.get('reachTwitter') ? item.get('reachFacebook') : '',
                    budget: item.get('reachTwitter') ? item.get('budget') : '',
                    cpcMax: item.get('reachTwitter') ? item.get('cpcMax') : '',
                    participant: item.get('participants') ? item.get('participants').map(function (participant) {
                        return participant.id;
                    }) : ''
                });
            });

            this.getScreen(function (item) {
                self.setState({
                    allScreen: item.map(function (elem) {
                        return {
                            id: elem.id,
                            image: elem.get('image')._url
                        }
                    })
                })
            });
        }
    };

    getReport = (callback)=> {
        let self = this;
        let query = new Parse.Query('Report');
        query.equalTo('objectId', this.props.params.id);
        query.include('campaign');
        query.first().then(function (report) {
            callback(report);
            self.getClicks(function (item) {
                self.setState({
                    validatedClick: item.map(function (elem) {
                        return {
                            id: elem.id
                        }
                    }),

                    uniqueUser: item.map(function (elem) {
                        return elem.userId;
                    }),

                    fbClicks: item.filter(function (elem) {
                        return elem.provider === 'facebook' || elem.provider === 'facebookPage';
                    }),

                    twClicks: item.filter(function (elem) {
                        return elem.provider === 'twitter';
                    }),

                    days: item.map(function (elem) {
                        return elem.timestamp;
                    })

                });

                if (self.state.clicks == 'all') {
                    clickGraphDetect = self.clickGraph();
                }
                else if (self.state.clicks == 'twitter') {
                    clickGraphDetect = self.twitterClickGraph();
                }
                else if (self.state.clicks == 'facebook') {
                    clickGraphDetect = self.facebookClickGraph();
                }
            });

            self.getMembers(function (item) {
                self.setState({
                    participantsInfo: self.fullFillMembers(item)
                })
            });

        });
    };

    getClicks(callback) {
        let self = this;
        let query = new Parse.Query('Click');

        let pointer = this.state.campaignsId.map(function (elem) {
            let pointer = new Parse.Object('Campaign');
            pointer.id = elem;
            return pointer
        });
        query.count().then(function (number) {

            query.limit(1000);
            query.skip(0);
            query.containedIn('campaign', pointer);
            query.include('campaign');
            query.equalTo('validated', true);
            query.addAscending('createdAt');

            var allObj = [];

            for (var i = 0; i <= number; i += 1000) {
                query.skip(i);
                query.find().then(function (click) {
                    allObj = allObj.concat(self.fullFill(click));

                    self.setState({
                        validatedClick: allObj
                    });

                    callback(allObj);
                });
            }

        });
    };

    getMembers(callback) {
        let self = this;
        let query = new Parse.Query('Member');

        query.count().then(function (number) {

            query.limit(1000);
            query.skip(0);
            query.containedIn('objectId', self.state.participant);
            query.addAscending('createdAt');

            var allObj = [];

            for (var i = 0; i <= number; i += 1000) {
                query.skip(i);
                query.find().then(function (member) {
                    allObj = allObj.concat(member);

                    callback(allObj);
                });
            }
        });
    };

    fullFill = (object)=> {
        return object.map(function (elem) {
            return {
                id: elem.id,
                userId: elem.get('userId'),
                provider: elem.get('provider'),
                timestamp: elem.get('timestamp').toISOString().substring(0, 10),
            }
        })
    };

    fullFillMembers = (object)=> {
        return object.map(function (elem) {
            return {
                id: elem.id,
                firstName: elem.get('firstName') ? elem.get('firstName') : '',
                lastName: elem.get('lastName') ? elem.get('lastName') : '',
                email: elem.get('email') ? elem.get('email') : '',
                country: elem.get('country') ? elem.get('country') : '',
                userInterest: elem.get('userInterests') ? elem.get('userInterests') : '',
                website: elem.get('website') ? elem.get('website') : ''
            }
        })
    };

    cpcPercent = (bigNumber, clicks, budget)=> {
        if (this.state.cpcMax.length === 0 || this.state.budget.length === 0) return null;

        let cpcMax = (Math.round(bigNumber * 100) / 100).toFixed(2);
        let cpcReal = (Math.round(parseInt(this.state.budget) / parseInt(this.state.validatedClick.length) * 100) / 100).toFixed(2)

        let middle_result = (cpcReal - cpcMax) / cpcMax;
        let result = middle_result * 100;
        return result.toFixed(0);
    };

    clicksPercent = (budget, cpcMax, realClick)=> {
        if (this.state.cpcMax.length === 0 || this.state.budget.length === 0) return null;
        let expCl = (parseInt(budget) / (Math.round(cpcMax * 100) / 100)).toFixed(0);
        let middle = (realClick - expCl) / expCl;
        let result = middle * 100;
        return result.toFixed(0);
    };

    getScreen = (callback)=> {
        let query = new Parse.Query('Screenshots');
        query.find().then(function (screen) {
            callback(screen);
        });
    };

    displayCampaign = ()=> {
        let camp = [];
        for (let i = 0; i < this.state.campaigns.length; i++) {
            camp.push(<p>{this.state.campaigns[i]}</p>)
        }
        return camp;
    };

    displayScreen = (array)=> {
        if (array.length == 0 || this.state.allScreen.length == 0) return;
        let screens = [];
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < this.state.allScreen.length; j++) {
                if (this.state.allScreen[j].id == array[i]) {
                    screens.push(
                        <div className="col-sm-4 col-xs-6 networks-title">
                            <img className="img-responsive portfolio-item" src={this.state.allScreen[j].image} alt=""/>
                        </div>
                    );
                }
            }

        }
        return screens;
    };

    uniqueUsers = (array)=> {
        return Array.from(new Set(array)).length;
    };

    uniqueUsersPerNetwork = (networkArray)=> {
        networkArray = networkArray.map(function (item) {
            return item.userId;
        });
        return Array.from(new Set(networkArray)).length;
    };

    setTwitterClicks = ()=> {
        this.setState({
            clicks: 'twitter'
        });
    };

    setFacebookClicks = ()=> {
        this.setState({
            clicks: 'facebook'
        });
    };

    setAllClicks = ()=> {
        this.setState({
            clicks: 'all'
        });
    };

    clickGraph = ()=> {
        let counts = {};
        let dataForChart = [];

        if (this.state.days.length == 0) return null;
        this.state.days.sort();
        this.state.days.forEach(function (x) {
            counts[x] = (counts[x] || 0) + 1;
        });

        for (let [key, value] of Object.entries(counts)) {
            let date = key.split('-');
            dataForChart.push(
                {
                    day: new Date(date[0], date[1], date[2]),
                    clicks: value
                }
            );
        }

        let x = function (d) {
                return d.day;
            },

            xLabel = "Date",
            yLabel = 'Clicks',
            xScale = 'time';

        let chartSeries = [
            {
                field: 'clicks',
                name: 'Clicks',
                color: '#d43346',
                style: {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    fillOpacity: 1
                }
            }
        ];
        return (
            <div>
                <div className="co-md-12 after-click-row">
                    <LineChart chartSeries={chartSeries}
                               viewBoxObject={{
                                   x: 0,
                                   y: 0,
                                   width: 500,
                                   height: 400
                               }}
                               title="Line Chart"
                               yAxisLabel="Altitude"
                               xAxisLabel="Elapsed Time (sec)"
                               width={1330} height={300}
                               data={dataForChart}
                               x={x}
                               xScale={xScale}
                               xLabel={xLabel}
                               yLabel={yLabel}
                    />
                </div>
            </div>
        )
    };

    twitterClickGraph = ()=> {
        let twCounts = {};
        let twitterDataForChart = [];

        if (this.state.days.length == 0) return null;

        let twDays = this.state.twClicks.map(function (days) {
            return days.timestamp;
        });

        twDays.sort();
        twDays.forEach(function (x) {
            twCounts[x] = (twCounts[x] || 0) + 1;
        });

        for (let [key, value] of Object.entries(twCounts)) {
            let date = key.split('-');
            twitterDataForChart.push(
                {
                    day: new Date(date[0], date[1], date[2]),
                    clicks: value
                }
            )
        }

        let x = function (d) {
                return d.day;
            },

            xLabel = "Date",
            yLabel = 'Clicks',
            xScale = 'time';

        let chartSeries = [
            {
                field: 'clicks',
                name: 'Clicks',
                color: '#00bcd4',
                style: {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    fillOpacity: 1
                }
            }
        ];

        return (
            <div>
                <div className="co-md-12 after-click-row">
                    <LineChart chartSeries={chartSeries}
                               width={1330} height={300}
                               data={twitterDataForChart}
                               x={x}
                               xScale={xScale}
                               xLabel={xLabel}
                               yLabel={yLabel}
                    />
                </div>
            </div>
        )
    };

    facebookClickGraph = ()=> {
        let fbCounts = {};
        let facebookDataForChart = [];

        this.state.days.sort();
        if (this.state.days.length == 0) return null;

        let fbDays = this.state.fbClicks.map(function (days) {
            return days.timestamp;
        });

        fbDays.sort();
        fbDays.forEach(function (x) {
            fbCounts[x] = (fbCounts[x] || 0) + 1;
        });

        for (let [key, value] of Object.entries(fbCounts)) {
            let date = key.split('-');
            facebookDataForChart.push(
                {
                    day: new Date(date[0], date[1], date[2]),
                    clicks: value
                }
            )
        }


        let x = function (d) {
                return d.day;
            },

            xLabel = "Date",
            yLabel = 'Clicks',
            xScale = 'time';

        let chartSeries = [
            {
                field: 'clicks',
                name: 'Clicks',
                color: 'rgb(54,120,155)',
                style: {
                    strokeWidth: 3,
                    strokeOpacity: 1,
                    fillOpacity: 1
                }
            }
        ];

        return (
            <div>
                <div className="co-md-12 after-click-row">
                    <LineChart chartSeries={chartSeries}
                               width={1330} height={300}
                               data={facebookDataForChart}
                               x={x}
                               xScale={xScale}
                               xLabel={xLabel}
                               yLabel={yLabel}
                    />
                </div>
            </div>
        )
    };

    seeFacebookScreen = ()=> {
        if (this.state.showFacebook) {
            this.setState({
                showFacebook: false,
                showTwitter: true
            });
        }
    };

    seeTwitterScreen = ()=> {
        if (this.state.showTwitter) {
            this.setState({
                showTwitter: false,
                showFacebook: true
            });
        }
    };

    seeAllScreen = ()=> {
        if (this.state.allScreens) {
            this.setState({
                showTwitter: true,
                showFacebook: true
            });
        }
    };

    displayParticipant = ()=> {
        if (this.state.participantsInfo.length === 0) return null;
        let row = [];
        for (let i = 0; i < this.state.participantsInfo.length; i++) {
            let participant = this.state.participantsInfo[i];
            row.push(
                <tbody>
                <tr>
                    <td>
                        {participant.firstName + ' ' + participant.lastName}
                    </td>
                </tr>
                </tbody>
            )
        }

        return row;
    };

    render() {
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-4 col-md-offset-4 text-center">
                            <img className="vyn-logo"
                                 src="http://valueyournetwork.com/wp-content/uploads/2016/11/value_your_network_influenceurs.png"
                                 alt="Value Your Network"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <h1 className="page-header main-text">{this.state.name}</h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <img className="img-responsive main-logo-w" src={this.state.logo} alt=""/>
                        </div>
                        <div className="col-md-4">
                            <span className="main-text  detail-report">Report Details</span>
                            <div className="row rep-detail mrt-5">
                                <div className="col-md-6">Customer name</div>
                                <div className="col-md-6">{this.state.customerName}</div>
                                <div className="col-md-6">Start date</div>
                                <div className="col-md-6">{this.state.startDate}</div>
                                <div className="col-md-6">End date</div>
                                <div className="col-md-6">{this.state.endDate}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 conversation">
                            Conversation
                        </div>
                    </div>
                    <div className="table-responsive text-center">
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th className="text-center  pad-td reach-color">
                                    <div className="reach">{this.uniqueUsers(this.state.uniqueUser)}</div>
                                    <div className="weight">Unique Users</div>
                                </th>
                                <th className="text-center  pad-td reach-color">
                                    <div className="reach">{this.state.validatedClick.length}</div>
                                    <div className="weight">Clicks</div>
                                </th>
                                <th className="text-center  pad-td reach-color">
                                    <div
                                        className="reach">{parseInt(this.state.twitterReach) + parseInt(this.state.facebookReach)}</div>
                                    <div className="weight">Total reach</div>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td className="pad-td main-color">{this.state.budget}
                                    <span className="glyphicon glyphicon-eur">&nbsp;</span>
                                    <div>Budget</div>
                                </td>
                                <td className="pad-td main-color">{this.state.cpcMax} <span
                                    className="glyphicon glyphicon-eur">&nbsp;</span>
                                    <div>Maximum cost per click</div>
                                </td>
                                <td className="pad-td main-color">{(parseInt(this.state.budget) / (Math.round(this.state.cpcMax * 100) / 100)).toFixed(0)}
                                    <div>Expected clicks</div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pad-td main-color">&nbsp;</td>
                                <td className="pad-td main-color">
                                    {(Math.round(parseInt(this.state.budget) / parseInt(this.state.validatedClick.length) * 100) / 100).toFixed(2)}
                                    <span className="glyphicon glyphicon-eur">&nbsp;</span>
                                    <div>Real cost per click</div>
                                </td>
                                <td className="pad-td main-color">{this.state.validatedClick.length}
                                    <div>Validated clicks</div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pad-td main-color">&nbsp;</td>
                                <td className="pad-td main-color">
                                    <div className="glyphicon glyphicon-arrow-down"></div>
                                    <div>Reduction cost per click</div>
                                </td>
                                <td className="pad-td main-color">
                                    <div className="glyphicon glyphicon-arrow-down"></div>
                                    <div>Earned Clicks</div>
                                </td>
                            </tr>
                            <tr>
                                <td className="pad-td main-color">&nbsp;</td>
                                <td className="pad-td main-color">{this.cpcPercent(this.state.cpcMax, this.state.validatedClick.length, this.state.budget)}%</td>
                                <td className="pad-td main-color">{this.clicksPercent(this.state.budget, this.state.cpcMax, this.state.validatedClick.length)}%</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="row">
                        <div className="col-md-12 timeline">
                            Timeline
                        </div>
                    </div>
                    <div className="row graph-row-main">
                        <div className="row clicks-row">
                            <div className="col-md-offset-7 col-md-1 text-center"><span className="main-text-red"
                                                                                        onClick={this.setAllClicks}>All clicks</span>
                            </div>
                            <div className="col-md-2 text-center"><span className="fb-color"
                                                                        onClick={this.setFacebookClicks}>Facebook clicks</span>
                            </div>
                            <div className="col-md-2"><span className="twAndfb" onClick={this.setTwitterClicks}>Twitter clicks</span>
                            </div>
                        </div>

                        {clickGraphDetect}
                    </div>
                    {/*<div className="row posts margin-participant">*/}
                        {/*<div className="col-md-12 timeline">*/}
                            {/*Participants*/}
                        {/*</div>*/}
                    {/*</div>*/}
                    {/*<div className="row posts margin-row-participant">*/}
                        {/*<div className="col-md-12">*/}
                            {/*<div className="table-responsive">*/}
                                {/*<table className="table">*/}
                                    {/*{this.displayParticipant()}*/}
                                {/*</table>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                    <div className="row posts">
                        <div className="col-md-2 timeline">
                            Posts
                        </div>
                        <div className="col-md-1 text-center">
                            <span className="gray" onClick={this.seeAllScreen}>All</span>
                        </div>
                        <div className="col-md-1">
                            <span className="gray" onClick={this.seeTwitterScreen}>Facebook</span>
                        </div>
                        <div className="col-md-1">
                            <span className="gray" onClick={this.seeFacebookScreen}>Twitter</span>
                        </div>
                    </div>
                    {this.state.showFacebook ?
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="page-header main-text postTitle">Facebook`s Top Posts
                                    {/*<span className="networks-detail-user"> Users: {this.uniqueUsersPerNetwork(this.state.fbClicks)} </span>*/}
                                    <span className="networks-detail-user"> Reach: {this.state.facebookReach} </span>
                                    <span className="networks-detail"> Clicks: {this.state.fbClicks.length} </span>
                                </div>
                            </div>
                            {this.displayScreen(this.state.facebookId)}
                            <hr/>
                        </div>
                        : null }

                    {this.state.showTwitter ?
                        <div className="row">
                            <div className="col-md-12">
                                <div className="page-header main-text postTitle">Twitter`s Top Posts
                                    {/*<span className="networks-detail-user"> Users: {this.uniqueUsersPerNetwork(this.state.twClicks)}</span>*/}
                                    <span className="twit-post-det"> Reach: {this.state.twitterReach} </span>
                                    <span className="networks-detail"> Clicks: {this.state.twClicks.length} </span>
                                </div>
                            </div>
                            {this.displayScreen(this.state.twitterId)}
                        </div> : null}
                    <hr/>
                    <footer>
                    </footer>
                </div>
            </div>
        )
    }
};