import autobind from 'autobind-decorator';
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

interface StateProps {
    selectedDistrictId?: number;
}

interface DispatchProps {
    onClearSelection: () => void;
    onResize: (width: number, height: number) => void;
}

type ClassKey = 'sidebar';

type Props = StateProps & DispatchProps;
type PropsWithStyles = Props & WithStyles<ClassKey>;

class Sidebar extends Component<PropsWithStyles> {

    render() {
        const { classes, onResize } = this.props;
        return (
            <div className={classes.sidebar}>
                {this.renderIntro()}
                {this.renderCbInfo()}
                {this.renderSearch()}
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

    @autobind
    private onCloseClicked() {
        this.props.onClearSelection();
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        selectedDistrictId: state.selectedDistrictId
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)<Props>(Sidebar));
