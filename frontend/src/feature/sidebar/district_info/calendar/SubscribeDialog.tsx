import { Component, default as React } from 'react';
import Dialog, { DialogActions, DialogTitle } from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import { bind } from 'lodash-decorators/bind';
import { DialogContent, DialogContentText, InputAdornment } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import ContentCopyIcon from 'material-ui-icons/ContentCopy';
import TextField from 'material-ui/TextField';
import SubscribeText from './subscribe-text.html';
import Html from '../../../../shared/components/Html';

interface Props {
    subscribeUrl: string;
    onDialogExited: () => void;
}

interface State {
    isOpen: boolean;
}

class SubscribeDialog extends Component<Props, State> {

    private inputEl: HTMLInputElement;

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
                <DialogTitle>Add to Calendar</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Html html={SubscribeText} />
                    </DialogContentText>
                    <TextField
                        inputRef={el => this.inputEl = el}
                        fullWidth={true}
                        value={this.props.subscribeUrl}
                        inputProps={{
                            readOnly: true,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={this.onCopyClicked}>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onDialogClose}>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }

    @bind()
    private onCopyClicked() {
        if (this.inputEl) {
            this.inputEl.select();
            document.execCommand('copy');
        }
    }

    @bind()
    private onDialogClose() {
        this.setState({ isOpen: false });
    }
}

export default SubscribeDialog;
