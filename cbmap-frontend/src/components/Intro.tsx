import { WithStyles } from 'material-ui';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { Theme, withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import React, { Component } from 'react';

interface Props { }

type PropsWithStyles = Props & WithStyles<'card' | 'title'>;

class Intro extends Component<PropsWithStyles> {

    render() {
        const { classes } = this.props;
        return (
            <Card className={classes.card}>
                <CardContent>
                    <Typography className={classes.title}>Find Your Community Board</Typography>
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
}

const styles = (theme: Theme) => ({
    card: {
        marginBottom: theme.spacing.unit
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
        color: theme.palette.text.secondary
    }
});

export default withStyles(styles)<Props>(Intro);