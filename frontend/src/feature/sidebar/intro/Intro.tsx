import { CardHeader, Menu, MenuItem, WithStyles } from 'material-ui';
import Card, { CardContent } from 'material-ui/Card';
import { Theme, withStyles } from 'material-ui/styles';
import React, { Component, MouseEvent } from 'react';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { bind } from 'lodash-decorators/bind';
import { connect } from 'react-redux';
import { RootAction } from '../../../shared/actions';
import { Dispatch } from 'redux';
import { push } from 'react-router-redux';
import IntroHtml from './intro.md';
import Html from '../../../shared/components/Html';

interface DispatchProps {
    onShowAbout: () => void;
    onShowStatus: () => void;
}

type Props = DispatchProps;
type PropsWithStyles = Props & WithStyles<'card'|'introText'>;

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
                    title="59Boards.nyc"
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
                <CardContent style={{ paddingTop: 0 }}>
                    <Html html={IntroHtml} classes={{root: classes.introText}} />
                </CardContent>
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
    },
    introText: {
        extend: theme.typography.body1,
        '& p': {
            marginTop: 0
        },
        '& ul': {
            marginBottom: 0
        },
        '& ul li': {
            paddingBottom: theme.spacing.unit
        },
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
