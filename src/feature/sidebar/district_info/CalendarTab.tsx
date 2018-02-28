import React, { Component } from 'react';
import _ from 'lodash';
import { CircularProgress, List, ListItem, ListItemText, ListSubheader, WithStyles } from 'material-ui';
import { Theme } from 'material-ui/styles';
import withStyles from 'material-ui/styles/withStyles';
import moment from 'moment';

interface Props {
    events?: CalendarEvent[];
}

type ClassKey =
    | 'eventAddress'
    | 'eventDate'
    | 'eventsHeader';

type PropsWithStyles = Props & WithStyles<ClassKey>;

class CalendarTab extends Component<PropsWithStyles> {

    render() {
        const { classes, events } = this.props;
        return (
            <List>
                { events && events.length > 0 && (
                    _(events)
                        .groupBy((event) => moment(event.date).format('MMMM YYYY'))
                        .map((monthEvents, month) => (
                            <React.Fragment key={`fragment-${month}`}>
                                <ListSubheader key={`header-${month}`}>{month}</ListSubheader>
                                { monthEvents.map((event: CalendarEvent) => (
                                    <ListItem key={`item-${event.id}`}>
                                        <div className={classes.eventDate}>
                                            <div>{moment(event.date).format('D')}</div>
                                            <div>{moment(event.date).format('ddd')}</div>
                                        </div>
                                        <ListItemText
                                            classes={{
                                                secondary: classes.eventAddress
                                            }}
                                            primary={event.title}
                                            secondary={event.address.join('\n')}
                                        />
                                    </ListItem>)
                                )}
                            </React.Fragment>)
                        )
                        .value()
                )}
                { events && events.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No Events Found, check website."/>
                    </ListItem>
                )}
                { !events && (
                    <CircularProgress/>
                )}
            </List>
        );
    }
}

const styles = (theme: Theme) => (
    {
        eventsHeader: {
            color: theme.palette.text.secondary
        },
        eventAddress: {
            whiteSpace: 'pre' as 'pre'
        },
        eventDate: {
            alignSelf: 'flex-start' as 'flex-start'
        }
    }
);

export default withStyles(styles)<Props>(CalendarTab);
