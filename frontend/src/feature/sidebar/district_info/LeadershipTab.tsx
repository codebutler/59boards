import React, { Component } from 'react';
import District from '../../../shared/models/District';
import DISTRICT_LEADERSHIP from '../../../shared/data/districts-leadership.json';
import DistrictLeadership from '../../../shared/models/DistrictLeadership';
import { List, ListItem, ListItemText, WithStyles } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';
import { Theme } from 'material-ui/styles';

interface Props {
    district: District;
}

type ClassKey =
    | 'emptyListContainer';

type PropsWithStyles = Props & WithStyles<ClassKey>;

class LeadershipTab extends Component<PropsWithStyles> {
    render() {
        const { classes } = this.props;
        const leadership = DISTRICT_LEADERSHIP[this.props.district.id] as DistrictLeadership;
        if (!leadership) {
            return (
                <div className={classes.emptyListContainer}>
                    <p>Information currently unavailable, check website.</p>
                </div>
            );
        }
        return (
            <List>
                <ListItem>
                    <ListItemText primary={leadership.districtManager} secondary={'District Manager'}/>
                </ListItem>
                <ListItem>
                    <ListItemText primary={leadership.chair} secondary={'Chair'}/>
                </ListItem>
            </List>
        );
    }
}

const styles = (theme: Theme) => (
    {
        emptyListContainer: {
            textAlign: 'center' as 'center',
            paddingTop: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit,
        }
    }
);

export default withStyles(styles)<Props>(LeadershipTab);
