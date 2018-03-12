import React, { Component } from 'react';
import { Theme, WithStyles } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';

interface Props {
    html: string;
}

type ClassKey =
    | 'root';

type PropsWithStyles = Props & WithStyles<ClassKey>;

class Html extends Component<PropsWithStyles> {
    render() {
        const { classes } = this.props;
        return (
            <span
                className={classes.root}
                dangerouslySetInnerHTML={{__html: this.props.html}}
            />
        );
    }
}

const styles = (theme: Theme) => ({
    root: {
        '& ul': {
            paddingLeft: theme.spacing.unit * 2,
        }
    }
});

export default withStyles(styles)(Html);
