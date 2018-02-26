import autobind from 'autobind-decorator';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootAction, clearSelection } from '../../shared/actions/index';
import { RootState } from '../../shared/models/RootState';
import DistrictInfo from '../district_info/DistrictInfo';
import Intro from '../intro/Intro';
import Search from '../search/Search';

interface StateProps {
    selectedDistrictId?: number;
}

interface DispatchProps {
    onClearSelection: () => void;
}

type Props = StateProps & DispatchProps;

class Sidebar extends Component<Props> {

    render() {
        return (
            <div className="Sidebar">
                <div className="Sidebar-search">
                    {this.renderIntro()}
                    {this.renderCbInfo()}
                    {this.renderSearch()}
                </div>
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
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Sidebar);
