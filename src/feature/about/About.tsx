import { Component, default as React } from 'react';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import { connect } from 'react-redux';
import { RootAction } from '../../shared/actions/index';
import { Dispatch } from 'redux';
import { push } from 'react-router-redux';
import { bind } from 'lodash-decorators/bind';
import { withStyles } from 'material-ui/styles';
import { Theme, WithStyles } from 'material-ui';

interface DispatchProps {
    onDialogExited: () => void;
}

type Props = DispatchProps;
type PropsWithStyles = Props & WithStyles<'dialogContentTextRoot'>;

interface State {
    isOpen: boolean;
}

class About extends Component<PropsWithStyles, State> {

    constructor(props: PropsWithStyles) {
        super(props);
        this.state = { isOpen: true };
    }

    render() {
        const { classes } = this.props;
        return (
            <Dialog
                open={this.state.isOpen}
                onClose={this.onDialogClose}
                onExited={this.props.onDialogExited}
            >
                <DialogTitle>About</DialogTitle>
                <DialogContent>
                    <DialogContentText classes={{ root: classes.dialogContentTextRoot }}>
                        Created By Eric Butler
                        <br/>
                        <a href="https://twitter.com/codebutler" target="_blank">@codebutler</a>
                        <br/>
                        <a href="https://github.com/codebutler/cbmap" target="_blank">GitHub</a>
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

const styles = (theme: Theme) => ({
    dialogContentTextRoot: {
        '& a': {
            color: theme.palette.secondary.main,
            textDecoration: 'none',
            '&:hover': {
                textDecoration: 'underline',
            }
        }
    }
});

export default connect(
    null,
    mapDispatchToProps
)(withStyles(styles)<Props>(About));
