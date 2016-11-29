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
                            <h3 className="page-header">Facebook</h3>
                        </div>
                        {this.displayScreen(this.state.facebookId)}
                    </div>
                    <hr/>
                    <div className="row">
                        <div className="col-lg-12">
                            <h3 className="page-header">Twitter</h3>
                        </div>
                        {this.displayScreen(this.state.twitterId)}
                    </div>
                    <hr/>
                    <footer>
                        <div className="row">
                            <div className="col-lg-12">
                                <p>Copyright &copy; VYN-Report</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        )
    }
}