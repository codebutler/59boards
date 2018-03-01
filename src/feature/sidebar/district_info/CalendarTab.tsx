import React, { Component } from 'react';
import _ from 'lodash';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, ListSubheader, WithStyles } from 'material-ui';
import { Theme } from 'material-ui/styles';
import withStyles from 'material-ui/styles/withStyles';
import moment from 'moment';
import District from '../../../shared/models/District';
import { Calendar } from '../../../shared/models/Calendar';
import PropTypes from 'prop-types';
import { SwipeableViewsChildContext } from '../../../shared/types/swipeable-views';
import Divider from 'material-ui/Divider';
import EventIcon from 'material-ui-icons/Event';

interface Props {
    district: District;
}

type ClassKey =
    | 'calendarList'
    | 'calendarListItemText'
    | 'eventAddress'
    | 'eventDate'
    | 'eventsHeader'
    | 'emptyListContainer';

type PropsWithStyles = Props & WithStyles<ClassKey>;

interface State {
    events?: CalendarEvent[];
    gcalSubscribeUrl?: string;
}

interface Context {
    swipeableViews: SwipeableViewsChildContext;
}

class CalendarTab extends Component<PropsWithStyles, State> {

    static contextTypes = {
        swipeableViews: PropTypes.object.isRequired,
    };

    context: Context;

    constructor(props: PropsWithStyles) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.fetchEvents();
    }

    componentDidUpdate(prevProps: PropsWithStyles, prevState: State) {
        if (this.props.district !== prevProps.district) {
            this.fetchEvents();
        }

        this.context.swipeableViews.slideUpdateHeight();
    }

    render() {
        const { classes } = this.props;
        const { events, gcalSubscribeUrl } = this.state;
        return (
            <div>
                { events && events.length > 0 && (
                    <List classes={{root: classes.calendarList}}>
                        <ListItem
                            button={true}
                            component="a"
                            href={gcalSubscribeUrl}
                            target="_blank"
                        >
                            <ListItemIcon>
                                <EventIcon/>
                            </ListItemIcon>
                            <ListItemText primary={'Add to Google Calendar'}/>
                        </ListItem>
                        <Divider/>
                        {_(events)
                            .groupBy((event) => moment(event.date).format('MMMM YYYY'))
                            .map((monthEvents, month) => (
                                <React.Fragment key={`fragment-${month}`}>
                                    <ListSubheader key={`header-${month}`}>{month}</ListSubheader>
                                    {monthEvents.map((event: CalendarEvent) => (
                                        <ListItem key={`item-${event.id}`}>
                                            <div className={classes.eventDate}>
                                                <div>{moment(event.date).format('D')}</div>
                                                <div>{moment(event.date).format('ddd')}</div>
                                            </div>
                                            <ListItemText
                                                classes={{
                                                    root: classes.calendarListItemText,
                                                    secondary: classes.eventAddress
                                                }}
                                                primary={event.summary}
                                                secondary={event.location}
                                            />
                                        </ListItem>)
                                    )}
                                </React.Fragment>)
                            )
                            .value()
                        }
                    </List>
                )}
                { events && events.length === 0 && (
                    <div className={classes.emptyListContainer}>
                        <p>No Events Found, check website.</p>
                    </div>
                )}
                { !events && (
                    <div className={classes.emptyListContainer}>
                        <CircularProgress/>
                    </div>
                )}
            </div>
        );
    }

    private fetchEvents() {
        this.setState({events: undefined});
        if (this.props.district.calendar) {
            const cal = new Calendar(this.props.district.calendar);
            cal.events
                .then((events) => {
                    this.setState({ events, gcalSubscribeUrl: cal.subscribeUrl });
                })
                .catch((err) => {
                    console.log('failed to get events', err);
                    this.setState({ events: [] });
                });
        } else {
            this.setState({ events: [] });
        }
    }
}

const styles = (theme: Theme) => (
    {
        // FIXME: First two styles are copy/pasted...
        calendarList: {
            overflow: 'hidden' as 'hidden',
            whiteSpace: 'nowrap' as 'nonowrap',
        },
        calendarListItemText: {
            maskImage: 'linear-gradient(left, white 80%, rgba(255,255,255,0) 100%)'
        },
        eventsHeader: {
            color: theme.palette.text.secondary
        },
        eventAddress: {
            whiteSpace: 'pre' as 'pre'
        },
        eventDate: {
            alignSelf: 'flex-start' as 'flex-start'
        },
        emptyListContainer: {
            textAlign: 'center' as 'center',
            paddingTop: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit,
        }
    }
);

export default withStyles(styles)<Props>(CalendarTab);
