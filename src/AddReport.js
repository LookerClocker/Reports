import React, {Component} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import DropzoneComponent from 'react-dropzone-component/lib/react-dropzone';
import '../node_modules/react-dropzone-component/styles/filepicker.css'
import '../node_modules/dropzone/dist/min/dropzone.min.css'
let Parse = require('parse').Parse;
let clickedCampArray=[];
let fbImageCollection=[];
let twitterImageCollection=[];
let fbImgId = [];
let twImgId = [];
let componentConfig = {
        iconFiletypes: ['.jpg', '.png', '.gif'],
        showFiletypeIcon: false,
        postUrl: '/uploadHandler'
    },
    djsConfig = {
        addRemoveLinks: true,
        acceptedFiles: 'image/jpeg,image/png,image/gif,application/pdf,application/txt',
        autoProcessQueue: true,
    },
    facebookDropzone,
    twitterDropzone,
    eventHandlersFb = {
        addedfile: function (file) {
            fbImageCollection.push(file);
            console.log('fb',fbImageCollection);
        },
    },
    eventHandlersTwitter = {
        addedfile: function (file) {
            twitterImageCollection.push(file);
            console.log('tw',twitterImageCollection);
        },
    };


export default class AddReport extends Component {
    constructor(props){
        super(props);
        this.state ={
            campaigns: [],
            value: 1,
            chosenCampaign: [],

            customerName: '',
            reportTitle: '',

            startDate: '',
            endDate: '',

            file: '',
            imagePreviewUrl: '',

            collectionImages: [],
            fbCollectionImgId: [],
            twCollectionImgId: [],
            facebookScreen:[],
            twitterScreen:[],

            message:'',
            buttTitle: '',

            editLogo: '',
            editCampaignList: [],
            editStartDate: '',
            editEndDate: ''



        }
    }

    componentDidMount() {
        let self = this;

        if (this.props.params.id) {
            this.getReport(function (item) {
                self.setState({
                    message: 'Report has been updated successfully!',
                    buttTitle: 'Save changes',
                    customerName: item.get('customerName'),
                    reportTitle: item.get('name'),
                    startDate: item.get('startDate'),
                    endDate: item.get('endDate'),
                    editStartDate: item.get('startDate').toISOString().substring(0, 10),
                    editEndDate: item.get('endDate').toISOString().substring(0, 10),
                    editLogo: item.get('logo')._url,
                    editCampaignList: item.get('campaign').map(function(camp){
                        return camp.get('ParentCampaign');
                    })
                });

            });
        }

        this.getCampaign(function (items) {
            self.setState({
                campaigns: items
            });
        });

        this.setState({
            facebookScreen: fbImageCollection,
            twitterScreen: twitterImageCollection,
        })
    }

    getReport = (callback)=> {
        var query = new Parse.Query('Report');
        query.include('campaign');
        query.equalTo('objectId', this.props.params.id);
        query.first({
            success: function (item) {
                callback(item);
            },
            error: function (error) {
                console.error('getReport() error', error);
                callback(null, error);
            }
        });
    };

    getCampaign = (callback)=> {
        let self = this;
        let query = new Parse.Query('Campaign');
        query.limit(1000);
        query.find().then(function(camp) {
            self.setState({
                campaigns: camp.map(function (item) {
                    if (item.get('ParentCampaign')) {
                        return {
                            id: item.id,
                            parentCamp: item.get('ParentCampaign')
                        }
                    }
                }).filter(function (n) {
                    return n !== undefined
                })
            });
            callback(self.state.campaigns);
        });
    };

    handleChange = (event, index, value) => {
        clickedCampArray.push(value);
        this.setState({
            value: value,
            chosenCampaign: clickedCampArray
        });
    };

    dropDownMenuItems = ()=> {
        if (this.state.campaigns.length === 0) {
            return null;
        }
        let row = [];
        for (let i = 0; i < this.state.campaigns.length; i++) {
            row.push(
                <MenuItem key={this.state.campaigns[i].id} value={this.state.campaigns[i].id} primaryText={this.state.campaigns[i].parentCamp}/>
            );
        }
        return row;
    };

    handlerStartDate = (event, date)=> {
        this.setState({
            startDate: date
        });
    };

    handlerEndDate = (event, date)=> {
        this.setState({
            endDate: date
        });
    };

    handleImageChange = (e)=> {
        e.preventDefault();

        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result,
                editLogo: ''
            });
        };

        reader.readAsDataURL(file)
    };

    initCallback = (dropzone)=> {
        facebookDropzone = dropzone;
        twitterDropzone = dropzone;
    };

    removeFile = ()=> {
        if (facebookDropzone) {
            facebookDropzone.removeFile();
        }
        if (twitterDropzone) {
            twitterDropzone.removeFile();
        }
    };

    handleAddReport = ()=> {
        var _this = this;

        var token = Math.random().toString(36).substr(2);

        var ScreenshotClass = Parse.Object.extend('Screenshots');
        var ReportClass = Parse.Object.extend('Report');
        var report = new ReportClass();

        // adding multiply images into Screenshots Class on Parse
        var imageName = '____image.png';

        for (var i = 0; i < this.state.facebookScreen.length; i++) {

            var screenshot = new ScreenshotClass();
            var parseImage = new Parse.File(imageName, this.state.facebookScreen[i]);

            parseImage.save().then(function () {
            }, function (error) {
                console.log('FB file could not been saved', error);
            });

            screenshot.set('image', parseImage);
            screenshot.save(null, {
                success: function (screenshot) {
                    fbImgId.push(screenshot.id);
                    _this.setState({
                        fbCollectionImgId: fbImgId
                    });
                    report.set('facebookScreenshot', _this.state.fbCollectionImgId.map(function (image) {
                        return {"__type": "Pointer", "className": "Screenshots", "objectId": image}

                    }));
                },

            }, {
                error: function (error) {
                    console.log(error);
                }
            });
        }

        for (let i = 0; i < this.state.twitterScreen.length; i++) {

            let screenshot = new ScreenshotClass();
            let parseImage = new Parse.File(imageName, this.state.twitterScreen[i]);

            parseImage.save().then(function () {
            }, function (error) {
                console.log('TW file could not been saved', error);
            });

            screenshot.set('image', parseImage);

            screenshot.save(null, {
                success: function (screenshot) {
                    twImgId.push(screenshot.id);
                    _this.setState({
                        twCollectionImgId: twImgId
                    });
                    report.set('twitterScreenshot', _this.state.twCollectionImgId.map(function (image) {
                        return {"__type": "Pointer", "className": "Screenshots", "objectId": image}

                    }));
                },

            }, {
                error: function (error) {
                    console.log(error);
                }
            });
        }

        // Adding data into Report Class

        report.set('name', this.state.reportTitle);
        report.set('customerName', this.state.customerName);
        report.set('startDate', this.state.startDate);
        report.set('endDate', this.state.endDate);
        report.set('campaign', this.state.chosenCampaign.map(function (camp) {
            return {"__type": "Pointer", "className": "Campaign", "objectId": camp}
        }));
        report.set('token', token);

        var fileName = '____logo.png';
        var parseFile = new Parse.File(fileName, this.state.file);

        parseFile.save().then(function () {
        }, function (error) {
            console.log('the file could not been saved', error);
        });
        report.set('logo', parseFile);

        // save and send data to Parse
        report.save(null, {
            success: function (report) {
                console.log('REPORT HAS SENT->', report);
            },

        }, {
            error: function (error) {
                console.log(error);
            }
        });

    };

    pushOldCampaign=()=>{
        let campaignsBefore=[];
        for(let i=0; i<this.state.editCampaignList.length; i++){
            campaignsBefore.push(<p key={i}>{this.state.editCampaignList[i]}</p>);
        }
        return campaignsBefore;
    };

    clickEndDate=()=>{
        this.setState({
            editEndDate: ''
        });
    };

    clickStartDate=()=>{
        this.setState({
            editStartDate: ''
        });
    };

    render(){
        if(this.props.params.id){
            var startDate, endDate, editLogoBlock, displayCampaigns ='Your campaigns';
            (this.state.editStartDate) ? startDate = (<input className="edit-input" type="text" value={this.state.editStartDate}/>) : '';
            (this.state.editEndDate) ? endDate = (<input className="edit-input" type="text" value={this.state.editEndDate}/>): '';
            if(this.state.editLogo) {
                editLogoBlock = <img className="logo-width edit-imag" src={this.state.editLogo} alt=""/>;
            }
        }

        var {imagePreviewUrl} = this.state;
        if (imagePreviewUrl) {
            var imagePreview = <img className="img-preview" src={imagePreviewUrl} alt="text"/>
        }

        return(
            <div className="main-padding">
                <div className="row mr-b logo-row">
                    <div className="col-md-6 col-md-offset-1">
                        <div className="row networks-row">
                            <div className="col-md-5">
                                <label for="title">Report title</label>
                                <input
                                    id="title"
                                    className="form-control"
                                    type="text"
                                    value={this.state.reportTitle}
                                    onChange={e=> this.setState({reportTitle: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-5">
                                <label for="name">Customer name</label>
                                <input
                                    id="name"
                                    className="form-control"
                                    type="text"
                                    value={this.state.customerName}
                                    onChange={e=> this.setState({customerName: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row dates">
                            <div className="col-md-2">
                                Start date
                            </div>
                            <div className="col-md-5">
                                <DatePicker
                                    hintText="Chose start date" mode="landscape"
                                    onClick={this.clickStartDate}
                                    onChange={this.handlerStartDate}
                                />
                                {startDate}
                            </div>
                        </div>
                        <div className="row dates old-campaigns">
                            <div className="col-md-2">
                                End date
                            </div>
                            <div className="col-md-5">
                                <DatePicker
                                    onClick={this.clickEndDate}
                                    onChange={this.handlerEndDate}
                                    hintText="Chose end date" mode="landscape"
                                />
                                {endDate}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-2">
                                {displayCampaigns}
                            </div>
                            <div className="col-md-5">
                                {this.pushOldCampaign()}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 text-center">
                            <input className="custom-file-input btn btn-default logo-width" type="file"
                                   onChange={this.handleImageChange}/>
                            {imagePreview}
                        {editLogoBlock}
                    </div>
                </div>

                <div className="row dates">
                    <div className="col-md-10 text-center col-md-offset-1">
                        Choose campaign
                    </div>
                </div>
                <div className="row dates">
                    <div className="col-md-10 text-center col-md-offset-1">
                        <DropDownMenu className="dropdown-width" value={this.state.value} onChange={this.handleChange}>
                            {this.dropDownMenuItems()}
                        </DropDownMenu>
                    </div>
                </div>

                <div className="row networks-row">
                    <div className="col-md-offset-1 col-md-2 networks-title">Facebook`s screenshots</div>
                    <div className="col-md-offset-1 col-xs-10">
                        <DropzoneComponent config={componentConfig}
                                           djsConfig={djsConfig}
                                           eventHandlers={eventHandlersFb}/>
                    </div>
                </div>
                <div className="row networks-row">
                    <div className="col-md-offset-1 col-md-2 networks-title">Twitter`s screenshots</div>
                    <div className="col-md-offset-1 col-xs-10">
                        <DropzoneComponent config={componentConfig}
                                           djsConfig={djsConfig}
                                           eventHandlers={eventHandlersTwitter}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-offset-1 col-md-10">
                        <button className="btn btn-default" onClick={this.handleAddReport}>Add report</button>
                    </div>
                </div>
            </div>
        )
    }
};