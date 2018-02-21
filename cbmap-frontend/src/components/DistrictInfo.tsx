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
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import DISTRICTS from '../data/boards.json';
import District from '../models/District';
import { GlobalState } from '../models/GlobalState';
import _ from 'lodash';

interface OwnProps {
    onCloseInfoClicked: () => void;
}

interface StateProps {
    district: District;
}

type Props = OwnProps & StateProps;

type PropsWithStyles = Props
    & WithStyles<'card' | 'cardHeader' | 'cardContent' | 'list' | 'listLink' | 'title' | 'eventsHeader'>;

interface State {
    events?: CalendarEvent[];
    selectedTab: number;
}

class DistrictInfo extends Component<PropsWithStyles, State> {

    state = {
        selectedTab: 0
    } as State;

    constructor(props: PropsWithStyles) {
        super(props);

        // FIXME fetch(`/data/events/${props.district.id}.json`)
        fetch ('/data/events/sample.json')
            .then((resp) => resp.json())
            .then((events: CalendarEvent[]) => {
                this.setState({ events });
            })
            .catch((err) => {
                console.log(err);
                this.setState({
                    events: []
                });
            });
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
            <List dense={true} className={classes.list}>
                {district.address && (
                    <ListItem button={true} component="li">
                        <Link
                            className={classes.listLink}
                            to={`https://maps.google.com?q=${encodeURIComponent(district.address)}`}
                            target="_blank"
                        >
                            <ListItemIcon>
                                <PlaceIcon/>
                            </ListItemIcon>
                            <ListItemText primary={district.address}/>
                        </Link>
                    </ListItem>
                )}
                { district.website && (
                    <ListItem button={true} component="li">
                        <Link
                            className={classes.listLink}
                            to={district.website}
                            target="_blank"
                        >
                            <ListItemIcon>
                                <LinkIcon/>
                            </ListItemIcon>
                            <ListItemText primary={district.website}/>
                        </Link>
                    </ListItem>
                )}
                { district.email && (
                    <ListItem button={true} component="li">
                        <Link
                            className={classes.listLink}
                            to={`mailto:${encodeURIComponent(district.email)}`}
                            target="_blank"
                        >
                            <ListItemIcon>
                                <EmailIcon/>
                            </ListItemIcon>
                            <ListItemText primary={district.email}/>
                        </Link>
                    </ListItem>
                )}
                { district.phone && (
                    <ListItem button={true}>
                        <ListItemIcon>
                            <PhoneIcon/>
                        </ListItemIcon>
                        <ListItemText primary={district.phone}/>
                    </ListItem>
                )}
            </List>
        );
    }

    private renderCalendarTab() {
        const { events } = this.state;
        return (
            <List>
                { events && events.length > 0 && (
                    _(events)
                        .groupBy((event) => moment(event.date).format('MMMM'))
                        .map((monthEvents, month) => (
                            <React.Fragment key={`fragment-${month}`}>
                                <ListSubheader key={`header-${month}`}>{month}</ListSubheader>
                                { monthEvents.map((event: CalendarEvent) => (
                                    <ListItem key={`item-${event.id}`}>
                                        <div>
                                            23
                                            <br/>
                                            Weds
                                        </div>
                                        <ListItemText primary={event.title}/>
                                    </ListItem>)
                                )}
                            </React.Fragment>)
                        ).value()
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

const styles = (theme: Theme) => ({
    card: {
        marginBottom: theme.spacing.unit
    },
    cardHeader: {
        paddingBottom: 0
    },
    cardContent: {
        padding: 0,
        paddingBottom: [theme.spacing.unit, '!important']
    },
    list: {
        overflow: 'hidden' as 'hidden'
    },
    listLink: {
        display: 'flex' as 'flex',
        alignItems: 'center' as 'center'
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
        color: theme.palette.text.secondary
    },
    eventsHeader: {
        color: theme.palette.text.secondary
    }
});

const mapStateToProps = (state: GlobalState): StateProps => {
    return {
        district: DISTRICTS[state.selectedDistrictId!]
    };
};

export default connect(
    mapStateToProps
)(withStyles(styles)<Props>(DistrictInfo));
