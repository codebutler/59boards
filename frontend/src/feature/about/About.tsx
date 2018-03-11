import { Component, default as React } from 'react';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import { connect } from 'react-redux';
import { RootAction } from '../../shared/actions';
import { Dispatch } from 'redux';
import { push } from 'react-router-redux';
import { bind } from 'lodash-decorators/bind';
import Html from '../../shared/components/Html';
import AboutHtml from './about.html';

interface DispatchProps {
    onDialogExited: () => void;
}

type Props = DispatchProps;

interface State {
    isOpen: boolean;
}

class About extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { isOpen: true };
    }

    render() {
        return (
            <Dialog
                open={this.state.isOpen}
                onClose={this.onDialogClose}
                onExited={this.props.onDialogExited}
            >
                <DialogTitle>About</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Html html={AboutHtml} />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }

    @bind()
    private onDialogClose() {
        this.setState({ isOpen: false });
    }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onDialogExited: () => {
            dispatch(push('/'));
        }
    };
};

export default connect(
    null,
    mapDispatchToProps
)(About);
