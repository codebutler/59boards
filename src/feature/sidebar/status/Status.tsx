import { Component, default as React } from 'react';
import { CardContent, CardHeader } from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Card from 'material-ui/Card';
import CloseIcon from 'material-ui-icons/Close';
import { RootAction } from '../../../shared/actions';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

interface DispatchProps {
    onCloseClicked: () => void;
}

type Props = DispatchProps;

class Status extends Component<Props> {

    render() {
        return (
            <Card>
                <CardHeader
                    action={(
                        <IconButton onClick={this.props.onCloseClicked}>
                            <CloseIcon/>
                        </IconButton>
                    )}
                    title="Status"
                />
                <CardContent>
                    hello.
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

export default connect(null, mapDispatchToProps)(Status);
