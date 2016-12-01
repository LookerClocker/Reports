import React, {Component} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import DropzoneComponent from 'react-dropzone-component/lib/react-dropzone';
import '../node_modules/react-dropzone-component/styles/filepicker.css'
import '../node_modules/dropzone/dist/min/dropzone.min.css'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ReportConfirm from './SuccessDialog';
let Parse = require('parse').Parse;
let clickedCampArray = [];
let fbImageCollection = [];
let twitterImageCollection = [];
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
        },
    },
    eventHandlersTwitter = {
        addedfile: function (file) {
            twitterImageCollection.push(file);
        },
    };

const customContentStyle = {
    width: '50%',
    maxWidth: 'none',
};


export default class AddReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
            facebookScreen: [],
            twitterScreen: [],

            message: 'Report has been added successfully',
            buttTitle: 'Add Report',

            editLogo: '',
            editCampaignList: [],
            editStartDate: '',
            editEndDate: '',

            chosenList: '',
            newCampaign: [],
            open: false,
            sentReport: false,
            duplicateCampaign: 'You have already chosen this campaign!',
            hintText: 'Please select another one',

            twitterReach: '',
            facebookReach: '',
            budget: '',
            cpcMax: ''
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
                    editCampaignList: item.get('campaign').map(function (camp) {
                        return camp.get('ParentCampaign');
                    }),
                    budget: item.get('budget'),
                    twitterReach: item.get('reachTwitter'),
                    facebookReach: item.get('reachFacebook'),
                    cpcMax: item.get('cpcMax')
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
        query.find().then(function (camp) {
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
        for (let i = 0; i < clickedCampArray.length; i++) {
            if (clickedCampArray[i] === value) {
                this.setState({
                    open: true
                });
                return;
            }
        }
        clickedCampArray.push(value);
        this.setState({
            value: value,
            chosenCampaign: clickedCampArray,
            chosenList: 'Your campaigns'
        });

        for (let i = 0; i < this.state.campaigns.length; i++) {
            if (this.state.campaigns[i].id === value) {
                this.state.newCampaign.push(this.state.campaigns[i].parentCamp);
            }
        }

    };

    dropDownMenuItems = ()=> {
        if (this.state.campaigns.length === 0) {
            return null;
        }
        let row = [];
        for (let i = 0; i < this.state.campaigns.length; i++) {
            row.push(
                <MenuItem key={this.state.campaigns[i].id} label=' ' value={this.state.campaigns[i].id}
                          primaryText={this.state.campaigns[i].parentCamp}/>
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

        let reader = new FileReader();
        let file = e.target.files[0];

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
        if (this.state.chosenCampaign.length === 0 || this.state.reportTitle.length === 0
            || this.state.customerName.length === 0 || this.state.startDate === 0 || this.state.endDate.length === 0) {
            this.setState({
                open: true,
                duplicateCampaign: 'Some fields are empty! Please check and try again.',
                hintText: ''
            });
            return;
        }
        if (this.props.params.id) {
            this.updateReport();
        } else {

            let self = this;
            let token = Math.random().toString(36).substr(2);
            let ScreenshotClass = Parse.Object.extend('Screenshots');
            let ReportClass = Parse.Object.extend('Report');
            let report = new ReportClass();

            // adding multiply images into Screenshots Class on Parse
            let imageName = '____image.png';
            let facebookScreen = 'facebookScreenshot';
            let twitterScreen = 'twitterScreenshot';

            this.sentScreen(fbImageCollection, ScreenshotClass, imageName, this.state.facebookScreen, fbImgId, report, facebookScreen);
            this.sentScreen(twitterImageCollection, ScreenshotClass, imageName, this.state.twitterScreen, twImgId, report, twitterScreen);

            report.set('name', this.state.reportTitle);
            report.set('customerName', this.state.customerName);
            report.set('startDate', this.state.startDate);
            report.set('endDate', this.state.endDate);
            report.set('campaign', this.state.chosenCampaign.map(function (camp) {
                return {"__type": "Pointer", "className": "Campaign", "objectId": camp}
            }));
            report.set('token', token);
            report.set('budget', this.state.budget);
            report.set('reachTwitter', this.state.twitterReach);
            report.set('reachFacebook', this.state.facebookReach);
            report.set('cpcMax', this.state.cpcMax);

            let fileName = '____logo.png';
            let parseFile = new Parse.File(fileName, this.state.file);
            parseFile.save().then(function () {
            }, function (error) {
                console.log('the file could not been saved', error);
            });
            report.set('logo', parseFile);
            report.save(null, {
                success: function (report) {
                    self.setState({
                        sentReport: true
                    });
                    console.log('REPORT HAS SENT->', report);
                },

            }, {
                error: function (error) {
                    console.log(error);
                }
            });
        }
    };

    sentScreen = (arrayImageCollection, ScreenshotsObject, imageName, arrayOfScreens, imgArrayIds, report, screenShots)=> {
        for (let i = 0; i < arrayImageCollection.length; i++) {
            let screenshot = new ScreenshotsObject();
            let parseImage = new Parse.File(imageName, arrayOfScreens[i]);
            parseImage.save().then(function () {
            }, function (error) {
                console.log('FB file could not been saved nto Screenshots table', error);
            });
            screenshot.set('image', parseImage);
            screenshot.save(null, {
                success: function (screen) {
                    imgArrayIds.push(screen.id);
                    report.set(screenShots, imgArrayIds.map(function (image) {
                        return {"__type": "Pointer", "className": "Screenshots", "objectId": image}
                    }));
                    report.save(null, {
                        success: function (report) {
                            console.log('REPORT HAS SENT image->', report);
                        },
                    }, {
                        error: function (error) {
                            console.log(error);
                        }
                    });
                },

            }, {
                error: function (error) {
                    console.log(error);
                }
            });
        }
    };

    updateReport = ()=> {
        let self = this;
        let query = new Parse.Query('Report');
        query.equalTo("objectId", this.props.params.id);

        let fileName = '____logo.png';

        let file;
        if(this.state.file.length === 0) {
            file = new File([this.state.editLogo], fileName, {type: 'image/jpeg'});
        } else {
            file = this.state.file
        }

        let parseFile = new Parse.File(fileName, file);

        parseFile.save().then(function () {
        }, function (error) {
            console.log('the file could not been saved', error);
        });

        let ScreenshotClass = Parse.Object.extend('Screenshots');
        let imageName = '____image.png';
        let facebookScreen = 'facebookScreenshot';
        let twitterScreen = 'twitterScreenshot';

        query.first().then(function (Report) {
            Report.save(null, {
                success: function (report) {
                    self.sentScreen(fbImageCollection, ScreenshotClass, imageName, self.state.facebookScreen, fbImgId, report, facebookScreen);
                    self.sentScreen(twitterImageCollection, ScreenshotClass, imageName, self.state.twitterScreen, twImgId, report, twitterScreen);
                    report.set('name', self.state.reportTitle);
                    report.set('customerName', self.state.customerName);
                    report.set('startDate', self.state.startDate);
                    report.set('endDate', self.state.endDate);
                    report.set('campaign', self.state.chosenCampaign.map(function (camp) {
                        return {"__type": "Pointer", "className": "Campaign", "objectId": camp}
                    }));
                    report.set('budget', self.state.budget);
                    report.set('reachTwitter', self.state.twitterReach);
                    report.set('reachFacebook', self.state.facebookReach);
                    report.set('cpcMax', self.state.cpcMax);
                    report.set('logo', parseFile);
                    report.save(null, {
                        success: function (report) {
                            self.setState({
                                sentReport: true,
                                message: 'Report has been successfully updated'
                            });
                            console.log(report);
                        },
                    })
                }
            });

        })
    };

    pushNewCampaign = ()=> {
        let campaignsCurrent = [];
        for (let i = 0; i < this.state.newCampaign.length; i++) {
            campaignsCurrent.push(<p key={i}>{this.state.newCampaign[i]}</p>);
        }
        return campaignsCurrent;
    };

    clickEndDate = ()=> {
        this.setState({
            editEndDate: ''
        });
    };

    clickStartDate = ()=> {
        this.setState({
            editStartDate: ''
        });
    };

    handleClose = () => {
        this.setState({
            open: false,
            duplicateCampaign: 'You have already chosen this campaign!',
            hintText: 'Please select another one'
        });
    };

    render() {
        const actions = [
            <FlatButton
                label="Ok"
                primary={true}
                onTouchTap={this.handleClose}
            />
        ];

        if (this.props.params.id) {
            var startDate, endDate, editLogoBlock;
            // var displayCampaigns = 'Your old campaigns';
            (this.state.editStartDate) ? startDate = (
                <input className="edit-input" type="text" value={this.state.editStartDate}/>) : '';
            (this.state.editEndDate) ? endDate = (
                <input className="edit-input" type="text" value={this.state.editEndDate}/>) : '';
            if (this.state.editLogo) {
                editLogoBlock = <img className="logo-width edit-imag" src={this.state.editLogo} alt=""/>;
            }
        }

        var {imagePreviewUrl} = this.state;
        if (imagePreviewUrl) {
            var imagePreview = <img className="img-preview" src={imagePreviewUrl} alt="text"/>
        }

        if (this.state.sentReport) {
            var reportConfirm = <ReportConfirm message={this.state.message}/>
        }

        return (
            <div className="main-padding main-margin">
                {reportConfirm}
                <Dialog
                    title={this.state.duplicateCampaign}
                    actions={actions}
                    modal={true}
                    contentStyle={customContentStyle}
                    open={this.state.open}
                >
                    {this.state.hintText}
                </Dialog>
                <div className="row mr-b logo-row">
                    <div className="col-md-5 col-md-offset-1">
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Logo</strong>
                            </div>
                            <div className="col-md-5">
                                {imagePreview}
                                {editLogoBlock}
                                <input className="custom-file-input btn btn-default logo-width" type="file"
                                       onChange={this.handleImageChange}/>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Report title</strong></div>
                            <div className="col-md-5">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.reportTitle}
                                    onChange={e=> this.setState({reportTitle: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Customer name</strong>
                            </div>
                            <div className="col-md-5">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.customerName}
                                    onChange={e=> this.setState({customerName: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row dates">
                            <div className="col-md-2">
                                <strong>Start date</strong>
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
                                <strong>End date</strong>
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
                                <strong>{this.state.chosenList}</strong>
                            </div>
                            <div className="col-md-5">
                                {this.pushNewCampaign()}
                            </div>
                        </div>
                    </div>
                    {/*<div className="col-md-3 text-center">*/}
                    {/*<input className="custom-file-input btn btn-default logo-width" type="file"*/}
                    {/*onChange={this.handleImageChange}/>*/}
                    {/*</div>*/}
                    <div className="col-md-6">
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Facebook reach</strong>
                            </div>
                            <div className="col-md-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.facebookReach}
                                    onChange={e=> this.setState({facebookReach: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Twitter reach</strong>
                            </div>
                            <div className="col-md-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.twitterReach}
                                    onChange={e=> this.setState({twitterReach: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>Budget</strong>
                            </div>
                            <div className="col-md-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.budget}
                                    onChange={e=> this.setState({budget: e.target.value})}>
                                </input>
                            </div>
                        </div>
                        <div className="row networks-row">
                            <div className="col-md-2">
                                <strong>cpcMax</strong>
                            </div>
                            <div className="col-md-4">
                                <input
                                    className="form-control"
                                    type="text"
                                    value={this.state.cpcMax}
                                    onChange={e=> this.setState({cpcMax: e.target.value})}>
                                </input>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row dates">
                    <div className="col-md-10 text-center col-md-offset-1">
                        <strong>Choose campaign</strong>
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
                    <div className="col-md-offset-1 col-md-2 networks-title"><strong>Facebook`s screenshots</strong>
                    </div>
                    <div className="col-md-offset-1 col-xs-10">
                        <DropzoneComponent config={componentConfig}
                                           djsConfig={djsConfig}
                                           eventHandlers={eventHandlersFb}/>
                    </div>
                </div>
                <div className="row networks-row">
                    <div className="col-md-offset-1 col-md-2 networks-title"><strong>Twitter`s screenshots</strong>
                    </div>
                    <div className="col-md-offset-1 col-xs-10">
                        <DropzoneComponent config={componentConfig}
                                           djsConfig={djsConfig}
                                           eventHandlers={eventHandlersTwitter}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-offset-1 col-md-10">
                        <button className="btn btn-default"
                                onClick={this.handleAddReport}>{this.state.buttTitle}</button>
                    </div>
                </div>
            </div>
        )
    }
};