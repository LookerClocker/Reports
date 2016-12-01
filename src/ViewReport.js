import React, {Component} from 'react';
let Parse = require('parse').Parse;
var d3 = require('d3');
var LineChart = require('react-d3-basic').LineChart;

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
            twitterId: []
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
                    facebookId: item.get('facebookScreenshot') ? item.get('facebookScreenshot').map(function (elem) {
                        return elem.id;
                    }) : '',
                    twitterId: item.get('twitterScreenshot') ? item.get('twitterScreenshot').map(function (elem) {
                        return elem.id;
                    }) : '',


                })
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

    }

    getReport = (callback)=> {
        let query = new Parse.Query('Report');
        query.equalTo('objectId', this.props.params.id);
        query.include('campaign');
        query.first().then(function (report) {
            callback(report);
        });
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
                        <div className="col-sm-3 col-xs-6">
                            <img className="img-responsive portfolio-item" src={this.state.allScreen[j].image} alt=""/>
                        </div>
                    );
                }
            }

        }
        return screens;
    };

    render() {

        console.log('d3', d3);

        var data = [
            {
                "clicks": 250,
                "index": 30
            },
            {
                "clicks": 500,
                "index": 33
            },
            {
                "clicks": 750,
                "index": 45
            },
            {
                "clicks": 1000,
                "index": 50
            }
        ];

        var chartSeries = [
                {
                    field: 'clicks',
                    name: 'clicks',
                    color: '#00bcd4',
                    style: {
                        "stroke-width": 2,
                        "stroke-opacity": .2,
                        "fill-opacity": .2
                    }
                }
            ],
            x = function (d) {
                console.log('this is d', d);
                return d.index;
            };

        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1 className="page-header">{this.state.name}</h1>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <img className="img-responsive" src={this.state.logo} alt=""/>
                        </div>
                        <div className="col-md-4">
                            <h3>Report Campaigns</h3>
                            {this.displayCampaign()}
                        </div>
                        <div className="col-md-4">
                            <h3>Report Details</h3>
                            <div className="row">
                                <div className="col-md-6"><strong>Customer name </strong></div>
                                <div className="col-md-6">{this.state.customerName}</div>
                                <div className="col-md-6"><strong>Start date</strong></div>
                                <div className="col-md-6">{this.state.startDate}</div>
                                <div className="col-md-6"><strong>End date</strong></div>
                                <div className="col-md-6">{this.state.endDate}</div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <h3 className="page-header">Facebook Top Posts</h3>
                        </div>
                        {this.displayScreen(this.state.facebookId)}
                    </div>
                    <hr/>
                    <div className="row">
                        <div className="col-lg-12">
                            <h3 className="page-header">Twitter Top Posts</h3>
                        </div>
                        {this.displayScreen(this.state.twitterId)}
                    </div>
                    <hr/>
                    <div className="row graph-row text-center">
                        <div className="col-md-offset-2 col-md-2 text-center">
                            <div className="clicks-box">
                                <div><span className="total-click-title">Total Clicks</span> <br/>
                                    <span className="total-click ">4,189</span>
                                </div>
                            </div>
                        </div>
                        <div className="past-row">
                            <ul>
                                <li className="click-ul click-title">Clicks for the past:</li>
                                <li className="click-ul">two hours</li>
                                <li className="click-ul">day</li>
                                <li className="click-ul">week</li>
                                <li className="click-ul">month</li>
                                <li className="click-ul">all time</li>
                            </ul>
                        </div>
                        <div className="co-md-12">
                            <LineChart width={1000} height={300} data={data} chartSeries={chartSeries} x={x}/>
                        </div>
                    </div>
                    <footer>
                    </footer>
                </div>
            </div>
        )
    }
}