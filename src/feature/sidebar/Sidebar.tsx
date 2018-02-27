import { bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { clearSelection, componentResized, RootAction } from '../../shared/actions';
import { RootState } from '../../shared/models/RootState';
import DistrictInfo from '../district_info/DistrictInfo';
import Intro from '../intro/Intro';
import Search from '../search/Search';
import withStyles from 'material-ui/styles/withStyles';
import { Theme } from 'material-ui/styles';
import { WithStyles } from 'material-ui';
import ReactResizeDetector from 'react-resize-detector';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router';
import Status from '../status/Status';
import districtIdFromRoute from '../../shared/selectors/district-id-from-route';

interface StateProps {
    selectedDistrictId?: number;
}

interface DispatchProps {
    onClearSelection: () => void;
    onResize: (width: number, height: number) => void;
}

type ClassKey = 'sidebar';

type Props = StateProps & DispatchProps;
type PropsWithRoute = Props & RouteComponentProps<{}>;
type PropsWithStyles = PropsWithRoute & WithStyles<ClassKey>;

class Sidebar extends Component<PropsWithStyles> {

    render() {
        const { classes, onResize } = this.props;
        return (
            <div className={classes.sidebar}>
                <Switch>
                    <Route exact={true} path="/status" component={Status} />
                    <Route
                        children={
                            (
                                <>
                                    {this.renderIntro()}
                                    {this.renderCbInfo()}
                                    {this.renderSearch()}
                                </>
                            )
                        }
                    />
                </Switch>
                <ReactResizeDetector
                    handleWidth={true}
                    handleHeight={true}
                    onResize={onResize}
                />
            </div>
        );
    }

    private renderIntro() {
        return !this.props.selectedDistrictId && (
            <Intro/>
        );
    }

    private renderCbInfo() {
        return this.props.selectedDistrictId && (
            <DistrictInfo onCloseInfoClicked={this.onCloseClicked} />
        );
    }

    private renderSearch() {
        return !this.props.selectedDistrictId && (
            <Search/>
        );
    }

    @bind()
    private onCloseClicked() {
        this.props.onClearSelection();
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        selectedDistrictId: districtIdFromRoute(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
    return {
        onClearSelection: () => {
            dispatch(clearSelection());
        },
        onResize: (width: number, height: number) => {
            dispatch(componentResized('sidebar', { width, height }));
        }
    };
};

const styles = (theme: Theme) => ({
    sidebar: {
        position: 'absolute' as 'absolute',
        maxHeight: '100%',
        overflow: 'scroll' as 'scroll',
        zIndex: 1,
        width: 392,
        maxWidth: '100%',
        padding: 8,
        [theme.breakpoints.down('xs')]: {
            width: '100%'
        }
    }
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(
        withStyles(styles)<PropsWithRoute>(Sidebar)
    )
);
