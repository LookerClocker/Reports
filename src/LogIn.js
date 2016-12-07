import React, {Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
let Parse = require('parse').Parse;

export default class LogIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userState: 'Login',
            open: false,
            password: '',
            login: 'sasha',
            dialogTitle: 'Type your password'
        };
    }

    componentWillMount(){
        if (Parse.User.current()) {
            this.setState({
                userState: 'Logout'
            })
        }
    };

    handleSend = () => {
        if(this.state.password === '') return;
        let self = this;
        Parse.User.logIn(this.state.login, this.state.password, {
            success: function () {
                self.setState({userState: 'logout', open: false});
                self.context.router.replace('/reports');
            },
            error: function (user, error) {
                self.setState({dialogTitle:'Your password is incorrect! Try again.'});
                console.log(user + error);
                return false;
            }
        });

        this.setState({
            password: ''
        });
    };

    handleOpen = () => {
        let self = this;
        if (Parse.User.current()) {
            Parse.User.logOut().then(function () {
                console.log('success logout');
                self.setState({userState: 'Login'});
                self.context.router.replace('/logout');
            }, function (error) {
                console.log('error');
            });
        }
        else {
            this.setState({open: true});
        }
    };

    handleClose = () => {
        this.setState({open: false, dialogTitle: 'Type your password'});
    };

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose}
            />,
                <FlatButton
                    label="login"
                    primary={true}
                    keyboardFocused={true}
                    onClick={this.handleSend}
                />
        ];
        const styles = {
            title: {
                cursor: 'pointer',
                color: '#fff'
            },
            textPosition: {
                textAlign: "center"
            },

            rowIntention: {
                "marginLeft": "10%"
            }
        };
        return (
            <div className="container-fluid">
                <FlatButton style={styles.title} label={this.state.userState} onClick={this.handleOpen}/>

                <Dialog
                    style={styles.textPosition}
                    title={this.state.dialogTitle}
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                >
                    <div style={styles.textPosition}>
                        <TextField
                            style={styles.rowIntention}
                            ref='password'
                            hintText="Password"
                            floatingLabelText="Password"
                            value={this.state.password}
                            onChange={e => this.setState({password: e.target.value})}>
                            <input type="password"/>
                        </TextField>
                    </div>

                </Dialog>

            </div>
        )
    }
};

LogIn.contextTypes = {
    router: React.PropTypes.object.isRequired
};