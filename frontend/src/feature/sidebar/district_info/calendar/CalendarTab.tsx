import React, { Component } from 'react';
import _, { Dictionary } from 'lodash';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, ListSubheader, WithStyles } from 'material-ui';
import { Theme } from 'material-ui/styles';
import withStyles from 'material-ui/styles/withStyles';
import moment, { Moment } from 'moment';
import District from '../../../../shared/models/District';
import { Calendar } from '../../../../shared/models/Calendar';
import PropTypes from 'prop-types';
import { SwipeableViewsChildContext } from '../../../../shared/types/swipeable-views';
import Divider from 'material-ui/Divider';
import EventIcon from 'material-ui-icons/Event';
import WarningIcon from 'material-ui-icons/Warning';
import { amber } from 'material-ui/colors';
import SubscribeDialog from './SubscribeDialog';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

interface Props {
    district: District;
}

type ClassKey =
    | 'calendarList'
    | 'calendarListItemText'
    | 'eventAddress'
    | 'eventDate'
    | 'eventDateDom'
    | 'eventDateDow'
    | 'eventsHeader'
    | 'emptyListContainer';

type PropsWithStyles = Props & WithStyles<ClassKey>;

interface State {
    events?: CalendarEvent[];
    isSubscribeDialogOpen: boolean;
    calendar?: Calendar;
    calendarWebUrl?: string;
}

interface Context {
    swipeableViews: SwipeableViewsChildContext;
}

enum RenderEventsState {
    LOADING,
    HAS_EVENTS,
    NO_EVENTS
}

interface RenderData {
    isScraped: boolean;
    calendarWebUrl?: string;
    calendarIcalUrl?: string;
    eventsState: RenderEventsState;
    eventsByMonth?: Dictionary<EventRenderData[]>;
}

interface EventRenderData {
    groupKey: string;
    monthText: string;
    domText: string;
    dowText: string;
    primaryText: string;
    secondaryText: string;
    fragmentKey: string;
    listItemKey: string;
    isFirstForDay: boolean;
}

class CalendarTab extends Component<PropsWithStyles, State> {

    static contextTypes = {
        swipeableViews: PropTypes.object.isRequired,
    };

    context: Context;

    constructor(props: PropsWithStyles) {
        super(props);
        this.state = { isSubscribeDialogOpen: false };
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
        const { isSubscribeDialogOpen } = this.state;
        const data = this.createRenderData();
        return (
            <div>
                { data.eventsState === RenderEventsState.LOADING && (
                    <div className={classes.emptyListContainer}>
                        <CircularProgress/>
                    </div>
                )}
                { data.eventsState === RenderEventsState.HAS_EVENTS && (
                    <List classes={{root: classes.calendarList}}>
                        <ListItem
                            button={true}
                            onClick={() => this.setState({ isSubscribeDialogOpen: true })}
                        >
                            <ListItemIcon>
                                <EventIcon/>
                            </ListItemIcon>
                            <ListItemText primary={'Add to Calendar'}/>
                        </ListItem>
                        <Divider/>
                        {data.isScraped && (
                            <ListItem>
                                <ListItemIcon>
                                    <WarningIcon style={{color: amber[700]}}/>
                                </ListItemIcon>
                                <ListItemText
                                    style={{color: amber[700], whiteSpace: 'normal'}}
                                    disableTypography={true}
                                    primary={'Unofficial event list, check website to confirm.'}
                                />
                            </ListItem>
                        )}
                        {_(data.eventsByMonth)
                            .map((monthEvents, month) => (
                                <React.Fragment key={`fragment-${month}`}>
                                    <ListSubheader key={`header-${month}`}>{month}</ListSubheader>
                                    {monthEvents.map((event: EventRenderData) => (
                                        <ListItem key={event.listItemKey}>
                                            <Grid container={true} spacing={0} wrap={'nowrap'}>
                                                <Grid
                                                    item={true}
                                                    className={classes.eventDate}
                                                    style={{visibility: event.isFirstForDay ? 'visible' : 'hidden'}}
                                                >
                                                    <Typography
                                                        className={classes.eventDateDom}
                                                    >
                                                        {event.domText}
                                                    </Typography>
                                                    <Typography
                                                        className={classes.eventDateDow}
                                                    >
                                                        {event.dowText}
                                                    </Typography>
                                                </Grid>
                                                <Grid item={true} style={{ flex: 1, overflow: 'hidden' as 'hidden'}}>
                                                    <ListItemText
                                                        classes={{
                                                            root: classes.calendarListItemText,
                                                            secondary: classes.eventAddress
                                                        }}
                                                        primary={event.primaryText}
                                                        secondary={event.secondaryText}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </ListItem>)
                                    )}
                                </React.Fragment>)
                            )
                            .value()
                        }
                    </List>
                )}
                { data.eventsState === RenderEventsState.NO_EVENTS && (
                    <div className={classes.emptyListContainer}>
                        <p>Events currently unavailable,
                            check <a href={data.calendarWebUrl} target="_blank">website</a>.</p>
                    </div>
                )}
                { isSubscribeDialogOpen && (
                    <SubscribeDialog
                        subscribeUrl={data.calendarIcalUrl!}
                        onDialogExited={() => this.setState({ isSubscribeDialogOpen: false })}
                    />
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
                    this.setState({ events, calendar: cal });
                })
                .catch((err) => {
                    console.log('failed to get events', err);
                    this.setState({ events: [] });
                });
        } else {
            this.setState({ events: [] });
        }
    }

    private createRenderData(): RenderData {
        const { district } = this.props;
        const { events, calendar } = this.state;

        const getEventState = (): RenderEventsState => {
            if (!events) {
                return RenderEventsState.LOADING;
            } else if (events && events.length > 0) {
                return RenderEventsState.HAS_EVENTS;
            } else {
                return RenderEventsState.NO_EVENTS;
            }
        };

        const getSecondaryText = (event: CalendarEvent, eventMoment: Moment): string => {
            const eventTime = eventMoment.format('h:mma');
            if (event.location) {
                return `${eventTime} at ${event.location}`;
            } else {
                return eventTime;
            }
        };

        const getIsFirstForDay = (list: ArrayLike<CalendarEvent>, index: number): boolean => {
            if (index === 0) {
                return true;
            }
            const prevEvent = list[index - 1];
            const thisEvent = list[index];
            return !moment(prevEvent.date).isSame(moment(thisEvent.date), 'day');
        };

        return {
            isScraped: !!(district.calendar && district.calendar.scraperId),
            calendarWebUrl: district.calendar ? district.calendar.web : district.website,
            calendarIcalUrl: calendar && calendar.icalUrl,
            eventsState: getEventState(),
            eventsByMonth: events && _(events)
                .map((event, index, list) => {
                    const eventMoment = moment(event.date);
                    return {
                        groupKey: eventMoment.format('MMMM YYYY'),
                        domText: eventMoment.format('D'),
                        dowText: eventMoment.format('ddd'),
                        primaryText: event.summary,
                        secondaryText: getSecondaryText(event, eventMoment),
                        fragmentKey: `fragment-${event.id}`,
                        listItemKey: `item-${event.id}`,
                        isFirstForDay: getIsFirstForDay(list, index)
                    } as EventRenderData;
                })
                .groupBy((event) => event.groupKey)
                .value()
        };
    }
}

const styles = (theme: Theme) => (
    {
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
            marginRight: theme.spacing.unit * 2
        },
        eventDateDom: {
            fontSize: '1.2rem'
        },
        eventDateDow: {
            fontSize: '0.8rem'
        },
        emptyListContainer: {
            textAlign: 'center' as 'center',
            paddingTop: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit,
        }
    }
);

export default withStyles(styles)<Props>(CalendarTab);
