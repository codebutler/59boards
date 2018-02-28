import { WithStyles } from 'material-ui';
import CloseIcon from 'material-ui-icons/Close';
import Card, { CardContent, CardHeader } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { Theme } from 'material-ui/styles';
import withStyles from 'material-ui/styles/withStyles';
import Tabs, { Tab } from 'material-ui/Tabs';
import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import { fetchEvents } from '../../../shared/actions/fetch-events';
import { RootAction } from '../../../shared/actions';
import DISTRICTS from '../../../shared/data/districts-info.json';
import District from '../../../shared/models/District';
import { RootState } from '../../../shared/models/RootState';
import SwipeableViews from 'react-swipeable-views';
import districtIdFromRoute from '../../../shared/selectors/district-id-from-route';
import ContactTab from './ContactTab';
import CalendarTab from './CalendarTab';

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
    | 'title';

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
        const { classes, district, events } = this.props;
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
                        <SwipeableViews
                            animateHeight={true}
                            index={this.state.selectedTab}
                            onChangeIndex={(index) => { this.setState({selectedTab: index}); }}
                        >
                            <ContactTab district={district}/>
                            <CalendarTab events={events}/>
                        </SwipeableViews>
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
        title: {
            marginBottom: 16,
            fontSize: 14,
            color: theme.palette.text.secondary
        }
    }
);

const mapStateToProps = (state: RootState): StateProps => {
    const selectedDistrictId = districtIdFromRoute(state)!;
    return {
        district: DISTRICTS[selectedDistrictId],
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
