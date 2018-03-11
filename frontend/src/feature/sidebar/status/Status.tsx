import { Component, default as React } from 'react';
import { CardContent, CardHeader, GridListTile, Theme, WithStyles } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Card from 'material-ui/Card';
import CloseIcon from 'material-ui-icons/Close';
import { RootAction } from '../../../shared/actions';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import DISTRICTS from '../../../shared/data/districts-info.json';
import District from '../../../shared/models/District';
import _ from 'lodash';
import red from 'material-ui/colors/red';
import green from 'material-ui/colors/green';
import orange from 'material-ui/colors/orange';
import withStyles, { ClassNameMap } from 'material-ui/styles/withStyles';
import GridList from 'material-ui/GridList';

interface DispatchProps {
    onCloseClicked: () => void;
}

type ClassKey =
    | 'cardContentRoot'
    | 'tileBad'
    | 'tileGood'
    | 'titleMediocre';

type Props = DispatchProps;
type PropsWithStyles = Props & WithStyles<ClassKey>;

class Status extends Component<PropsWithStyles> {

    private static classForTile(district: District, classes: ClassNameMap<ClassKey>): string {
        const isGood = !!(district.calendar
            && (district.calendar.ical || district.calendar.googleCalendarId));
        const isScraped = district.calendar && district.calendar.scraped;
        return isGood ? (isScraped ? classes.titleMediocre : classes.tileGood) : classes.tileBad;
    }

    render() {
        const { classes } = this.props;
        return (
            <Card>
                <CardHeader
                    action={(
                        <IconButton onClick={this.props.onCloseClicked}>
                            <CloseIcon/>
                        </IconButton>
                    )}
                    title="Calendar Status"
                />
                <CardContent classes={{root: classes.cardContentRoot}}>
                    <GridList
                        cols={2}
                        cellHeight={40}
                    >
                        {
                            _.toPairs(DISTRICTS).map(([key, district]: [string, District]) => (
                                <GridListTile
                                    key={key}
                                    classes={{tile: Status.classForTile(district, classes)}}
                                    onClick={() => alert(JSON.stringify(district, null, '  '))}
                                >
                                    {`${district.borough} CB${district.number}`}
                                </GridListTile>
                            ))
                        }
                    </GridList>
                </CardContent>
            </Card>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onCloseClicked: () => {
            dispatch(push('/'));
        }
    };
};

const tileStyle = {
    display: 'flex',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    cursor: 'pointer',
};

const styles = (theme: Theme) => ({
    cardContentRoot: {
        paddingTop: 0
    },
    tileGood: {
        extend: tileStyle,

        backgroundColor: green[300],
        '&:hover': {
            backgroundColor: green[400],
        }
    },
    tileBad: {
        extend: tileStyle,

        backgroundColor: red[300],
        '&:hover': {
            backgroundColor: red[400],
        }
    },
    titleMediocre: {
        extend: tileStyle,

        backgroundColor: orange[300],
        '&:hover': {
            backgroundColor: orange[400],
        }
    }
});

export default connect(null, mapDispatchToProps)(withStyles(styles)<Props>(Status));
