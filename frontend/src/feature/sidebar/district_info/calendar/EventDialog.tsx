import Dialog from 'material-ui/Dialog/Dialog';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import DialogContent from 'material-ui/Dialog/DialogContent';
import AccessTimeIcon from 'material-ui-icons/AccessTime';
import PlaceIcon from 'material-ui-icons/Place';
import React, { Component } from 'react';
import TextFieldsIcons from 'material-ui-icons/ShortText';
import Grid from 'material-ui/Grid/Grid';
import DialogActions from 'material-ui/Dialog/DialogActions';
import Button from 'material-ui/Button/Button';
import Html from '../../../../shared/components/Html';
import moment from 'moment';
import { Theme, WithStyles } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';
import { bind } from 'lodash-decorators/bind';

interface Props {
    event: CalendarEvent;
    onDialogExited: () => void;
}

interface State {
    isOpen: boolean;
}

type PropsWithStyles = Props & WithStyles<'eventDescription'>;

class EventDialog extends Component<PropsWithStyles, State> {

    constructor(props: PropsWithStyles) {
        super(props);
        this.state = { isOpen: true };
    }

    render(): React.ReactNode {
        const { event, classes } = this.props;
        return (
            <Dialog
                open={this.state.isOpen}
                onClose={this.onDialogClose}
                onExited={this.props.onDialogExited}
            >
                <DialogTitle>{event.summary}</DialogTitle>
                <DialogContent>
                    <Grid container={true}>
                        <Grid item={true} xs={1}>
                            <AccessTimeIcon color="action"/>
                        </Grid>
                        <Grid item={true} xs={11}>
                            {moment(event.date).format('LLL')}
                        </Grid>
                        {event.location && <>
                            <Grid item={true} xs={1}>
                                <PlaceIcon color="action"/>
                            </Grid>
                            <Grid item={true} xs={11}>
                                {event.location}
                            </Grid>
                        </>}
                        {event.description && <>
                            <Grid item={true} xs={1}>
                                <TextFieldsIcons color="action"/>
                            </Grid>
                            <Grid item={true} xs={11}>
                                <Html html={event.description} classes={{root: classes.eventDescription}}/>
                            </Grid>
                        </>}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={this.onDialogClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    @bind()
    private onDialogClose() {
        this.setState({ isOpen: false });
    }
}

const styles = (theme: Theme) => ({
    eventDescription: {
        whiteSpace: 'pre-line' as 'pre-line'
    }
});

export default withStyles(styles)<Props>(EventDialog);
