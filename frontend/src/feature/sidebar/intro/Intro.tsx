import { CardHeader, Menu, MenuItem, WithStyles } from 'material-ui';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { Theme, withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import React, { Component, MouseEvent } from 'react';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { bind } from 'lodash-decorators/bind';
import { connect } from 'react-redux';
import { RootAction } from '../../../shared/actions';
import { Dispatch } from 'redux';
import { push } from 'react-router-redux';

interface DispatchProps {
    onShowAbout: () => void;
    onShowStatus: () => void;
}

type Props = DispatchProps;
type PropsWithStyles = Props & WithStyles<'card'>;

interface State {
    menuAnchorEl?: HTMLElement;
}

class Intro extends Component<PropsWithStyles, State> {

    state = {} as State;

    render() {
        const { classes } = this.props;
        const { menuAnchorEl } = this.state;
        return (
            <Card className={classes.card}>
                <CardHeader
                    action={
                        <IconButton onClick={this.onShowMenuButtonClick}>
                            <MoreVertIcon />
                        </IconButton>}
                    title="NYC Community Boards"
                    subheader="Find Your Community Board"
                />
                <Menu
                    id="simple-menu"
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={this.onMenuClose}
                >
                    <MenuItem onClick={this.onStatusItemClick}>Status</MenuItem>
                    <MenuItem onClick={this.onAboutItemClick}>About</MenuItem>
                </Menu>
                <CardContent>
                    <Typography component="p">
                        Community boards play an important role in improving the quality of life for all
                        New Yorkers, but many people don't know a lot about them or how they operate.
                        Enter your address below or select a district on the map to find your community board and get
                        involved!
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button
                        size="small"
                        color="primary"
                        href="http://www.nyc.gov/html/cau/html/cb/about.shtml"
                        target="_blank"
                    >
                        Learn More
                    </Button>
                </CardActions>
            </Card>
        );
    }

    @bind()
    private onShowMenuButtonClick(event: MouseEvent<HTMLElement>) {
        this.setState({ menuAnchorEl: event.currentTarget });
    }

    @bind()
    private onStatusItemClick(event: MouseEvent<HTMLElement>) {
        this.props.onShowStatus();
        this.onMenuClose();
    }

    @bind()
    private onAboutItemClick(event: MouseEvent<HTMLElement>) {
        this.props.onShowAbout();
        this.onMenuClose();
    }

    @bind()
    private onMenuClose() {
        this.setState({ menuAnchorEl: undefined });
    }
}

const styles = (theme: Theme) => ({
    card: {
        marginBottom: theme.spacing.unit
    }
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onShowAbout: () => {
            dispatch(push('/about'));
        },
        onShowStatus: () => {
            dispatch(push('/status'));
        }
    };
};

export default connect(
    null,
    mapDispatchToProps
)(withStyles(styles)<Props>(Intro));
