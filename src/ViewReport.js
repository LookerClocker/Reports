import React, {Component} from 'react';
let Parse = require('parse').Parse;

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
            uniqueUser: []
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
                    cpcMax: item.get('reachTwitter') ? item.get('cpcMax') : ''
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
                        return elem.get('userId')
                    })
                });
            });
        });
    };

    getClicks = (callback)=> {
        let query = new Parse.Query('Click');
        let pointer = this.state.campaignsId.map(function (elem) {
            let pointer = new Parse.Object('Campaign');
            pointer.id = elem;
            return pointer
        });
        query.limit(1000);
        query.containedIn('campaign', pointer);
        query.include('campaign');
        query.equalTo('validated', true);
        query.find().then(function (click) {
            callback(click);
        });
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
                            <img className="img-responsive portfolio-item static-img" src={this.state.allScreen[j].image} alt=""/>
                        </div>
                    );
                }
            }

        }
        return screens;
    };

    uniqueUsers(array) {
        return Array.from(new Set(array)).length;
    }

    render() {
        // console.log('campaignsID', this.state.campaignsId);
        // console.log('validate click', this.state.validatedClick);
        // console.log('array', this.state.array);
        // console.log('uniqueUser', this.state.uniqueUser);
        // console.log('uniqueUser2 ', this.uniqUsers(this.state.uniqueUser));
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
                            <h3 className="main-text">Report Details</h3>
                            <div className="row rep-detail">
                                <div className="col-md-6"><strong>Customer name </strong></div>
                                <div className="col-md-6"><strong>{this.state.customerName}</strong></div>
                                <div className="col-md-6"><strong>Start date</strong></div>
                                <div className="col-md-6"><strong>{this.state.startDate}</strong></div>
                                <div className="col-md-6"><strong>End date</strong></div>
                                <div className="col-md-6"><strong>{this.state.endDate}</strong></div>
                            </div>
                        </div>
                    </div>
                    <div className="body-click ">
                        <div className="row text-center page-header">
                            <div className="col-md-4 main-text title-uniq">
                                <strong>{this.uniqueUsers(this.state.uniqueUser)}</strong></div>
                            <div className="col-md-4 main-text title-uniq">
                                <strong>{this.state.validatedClick.length}</strong></div>
                            <div className="col-md-4 main-text title-uniq">
                                <strong>{parseInt(this.state.twitterReach) + parseInt(this.state.facebookReach)}</strong>
                            </div>
                        </div>
                        <div className="row text-center">
                            <div className="col-md-4 main-text"><strong>Unique Users</strong></div>
                            <div className="col-md-4 main-text"><strong>Clicks</strong></div>
                            <div className="col-md-4 main-text"><strong>Total reaches</strong></div>
                        </div>
                        <div className="row text-center budget-row">
                            <div className="col-md-4"><strong>{this.state.budget} <span
                                className="glyphicon glyphicon-eur"></span></strong><p>budget</p></div>
                            <div className="col-md-4"><strong>{this.state.cpcMax} <span
                                className="glyphicon glyphicon-eur"></span></strong><p>cpcMax</p></div>
                            <div className="col-md-4">
                                <strong>{(parseInt(this.state.budget) / (Math.round(this.state.cpcMax * 100) / 100)).toFixed(0)}</strong>
                                <p>expected clicks</p></div>
                        </div>
                        <div className="row text-center budget-row">
                            <div className="col-md-offset-4 col-md-4">
                                <strong>{(Math.round(parseInt(this.state.budget) / parseInt(this.state.validatedClick.length) * 100) / 100).toFixed(2)}
                                    <span className="glyphicon glyphicon-eur"></span>
                                </strong><p>cpcReal</p>
                            </div>
                            <div className="col-md-4"><strong>{this.state.validatedClick.length}</strong><p>validated
                                clicks</p></div>
                        </div>

                        <div className="row text-center glyph-row main-text">
                            <div className="col-md-offset-4 col-md-4">
                                <div className="glyphicon glyphicon-arrow-down "></div>
                                <p>Reduction CPC</p>
                            </div>
                            <div className="col-md-4">
                                <div className="glyphicon glyphicon-arrow-down"></div>
                                <p>Earned Clicks</p>
                            </div>
                        </div>
                        <div className="row text-center glyph-click">
                            <div className="col-md-offset-4 col-md-4">
                                <strong>{this.cpcPercent(this.state.cpcMax, this.state.validatedClick.length, this.state.budget)}
                                    %</strong></div>
                            <div className="col-md-4">
                                <strong>{this.clicksPercent(this.state.budget, this.state.cpcMax, this.state.validatedClick.length)}
                                    %</strong></div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <h3 className="page-header main-text"><strong>Facebook`s Top Posts</strong></h3>
                        </div>
                        {this.displayScreen(this.state.facebookId)}
                    </div>
                    <hr/>
                    <div className="row">
                        <div className="col-lg-12">
                            <h3 className="page-header main-text"><strong>Twitter`s Top Posts</strong></h3>
                        </div>
                        {this.displayScreen(this.state.twitterId)}
                    </div>
                    <hr/>
                    <footer>
                    </footer>
                </div>
            </div>
        )
    }
}