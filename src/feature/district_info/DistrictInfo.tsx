import _ from 'lodash';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, ListSubheader, WithStyles } from 'material-ui';
import CloseIcon from 'material-ui-icons/Close';
import EmailIcon from 'material-ui-icons/Email';
import LinkIcon from 'material-ui-icons/Link';
import PhoneIcon from 'material-ui-icons/Phone';
import PlaceIcon from 'material-ui-icons/Place';
import Card, { CardContent, CardHeader } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { Theme } from 'material-ui/styles';
import withStyles from 'material-ui/styles/withStyles';
import Tabs, { Tab } from 'material-ui/Tabs';
import moment from 'moment';
import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import { fetchEvents } from '../../shared/actions/fetch-events';
import { RootAction } from '../../shared/actions';
import DISTRICTS from '../../shared/data/boards.json';
import District from '../../shared/models/District';
import { RootState } from '../../shared/models/RootState';

interface OwnProps {
    onCloseInfoClicked: () => void;
}

interface StateProps {
    district: District;
    events?: CalendarEvent[];
}

interface DispatchProps {
    fetchCalendarEvents: (districtId: number) => void;
}

type ClassKey =
    | 'card'
    | 'cardHeader'
    | 'cardContent'
    | 'contactList'
    | 'contactListItemText'
    | 'title'
    | 'eventAddress'
    | 'eventDate'
    | 'eventsHeader';

type Props = OwnProps & StateProps & DispatchProps;
type PropsWithStyles = Props & WithStyles<ClassKey>;

interface State {
    selectedTab: number;
}

class DistrictInfo extends Component<PropsWithStyles, State> {

    state = {
        selectedTab: 0
    } as State;

    constructor(props: PropsWithStyles) {
        super(props);
        this.props.fetchCalendarEvents(props.district.id);
    }

    render() {
        const { classes, district } = this.props;
        if (district) {
            return (
                <Card className={classes.card}>
                    <CardHeader
                        className={classes.cardHeader}
                        action={(
                            <IconButton onClick={this.props.onCloseInfoClicked}>
                                <CloseIcon/>
                            </IconButton>
                        )}
                        title={`${district.borough} CB${district.number}`}
                        subheader={district.neighborhoods}
                    />
                    <CardContent className={classes.cardContent}>
                        <Tabs
                            value={this.state.selectedTab}
                            onChange={(event, value) => this.setState({ selectedTab: value })}
                            indicatorColor="primary"
                            textColor="primary"
                            centered={true}
                        >
                            <Tab label="Contact" />
                            <Tab label="Calendar" />
                        </Tabs>
                        {this.state.selectedTab === 0 && this.renderContactTab()}
                        {this.state.selectedTab === 1 && this.renderCalendarTab()}
                    </CardContent>
                </Card>
            );
        } else {
            return (
                <Card className={classes.card}>
                    <CardHeader
                        action={(
                            <IconButton onClick={this.props.onCloseInfoClicked}>
                                <CloseIcon/>
                            </IconButton>
                        )}
                        title="No Community Board"
                    />
                </Card>
            );
        }
    }

    private renderContactTab() {
        const { classes, district } = this.props;
        return (
            <List
                dense={true}
                classes={{root: classes.contactList}}
                component="div"
            >
                {district.address && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`https://maps.google.com?q=${encodeURIComponent(district.address)}`}
                        target={'_blank'}
                    >
                        <ListItemIcon>
                            <PlaceIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.address}
                        />
                    </ListItem>
                )}
                { district.website && (
                    <ListItem
                        button={true}
                        component="a"
                        href={district.website}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <LinkIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.website}
                        />
                    </ListItem>
                )}
                { district.email && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`mailto:${encodeURIComponent(district.email)}`}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <EmailIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.email}
                        />
                    </ListItem>
                )}
                { district.phone && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`tel:${encodeURIComponent(district.phone)}`}
                    >
                        <ListItemIcon>
                            <PhoneIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.phone}
                        />
                    </ListItem>
                )}
            </List>
        );
    }

    private renderCalendarTab() {
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
        card: {
            marginBottom: theme.spacing.unit
        },
        cardHeader: {
            paddingBottom: 0
        },
        cardContent: {
            padding: 0,
            '&:last-child': {
                paddingBottom: theme.spacing.unit
            }
        },
        contactList: {
            overflow: 'hidden' as 'hidden',
            whiteSpace: 'nowrap' as 'nonowrap',
        },
        contactListItemText: {
            maskImage: 'linear-gradient(left, white 80%, rgba(255,255,255,0) 100%)'
        },
        title: {
            marginBottom: 16,
            fontSize: 14,
            color: theme.palette.text.secondary
        },
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

const mapStateToProps = (state: RootState): StateProps => {
    return {
        district: DISTRICTS[state.selectedDistrictId!],
        events: state.events
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        fetchCalendarEvents: (districtId: number) => {
            dispatch(fetchEvents(districtId));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)<Props>(DistrictInfo));
