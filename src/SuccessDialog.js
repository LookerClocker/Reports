import React, {Component} from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class ReportConfirm extends Component {
    state = {
        open: true,
    };

    handleClose = () => {
        this.setState({open: false});
        window.location ='/reports'
    };

    render() {
        const actions = [
            <FlatButton
                label="OK"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClose}
            />,
        ];

        return (
            <div>
                <Dialog
                    title="Success"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                >
                    {this.props.message}
                </Dialog>
            </div>
        );
    }
}