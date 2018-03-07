import React, { Component } from 'react';
import LinkIcon from 'material-ui-icons/Link';
import PhoneIcon from 'material-ui-icons/Phone';
import PlaceIcon from 'material-ui-icons/Place';
import EmailIcon from 'material-ui-icons/Email';
import { List, ListItem, ListItemIcon, ListItemText, WithStyles } from 'material-ui';
import withStyles from 'material-ui/styles/withStyles';
import { Theme } from 'material-ui/styles';
import District from '../../../shared/models/District';

interface Props {
    district: District;
}

type ClassKey =
    | 'contactList'
    | 'contactListItemText';

type PropsWithStyles = Props & WithStyles<ClassKey>;

class ContactTab extends Component<PropsWithStyles> {

    render() {
        const { classes, district } = this.props;
        return (
            <List
                dense={true}
                classes={{root: classes.contactList}}
                component="div"
            >
                {district.address && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`https://maps.google.com?q=${encodeURIComponent(district.address)}`}
                        target={'_blank'}
                    >
                        <ListItemIcon>
                            <PlaceIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.address}
                        />
                    </ListItem>
                )}
                { district.website && (
                    <ListItem
                        button={true}
                        component="a"
                        href={district.website}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <LinkIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.website}
                        />
                    </ListItem>
                )}
                { district.email && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`mailto:${encodeURIComponent(district.email)}`}
                        target="_blank"
                    >
                        <ListItemIcon>
                            <EmailIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.email}
                        />
                    </ListItem>
                )}
                { district.phone && (
                    <ListItem
                        button={true}
                        component="a"
                        href={`tel:${encodeURIComponent(district.phone)}`}
                    >
                        <ListItemIcon>
                            <PhoneIcon/>
                        </ListItemIcon>
                        <ListItemText
                            classes={{root: classes.contactListItemText}}
                            primary={district.phone}
                        />
                    </ListItem>
                )}
            </List>
        );
    }
}

const styles = (theme: Theme) => (
    {
        contactList: {
            overflow: 'hidden' as 'hidden',
            whiteSpace: 'nowrap' as 'nonowrap',
        },
        contactListItemText: {
            maskImage: 'linear-gradient(left, white 80%, rgba(255,255,255,0) 100%)'
        },
    });

export default withStyles(styles)<Props>(ContactTab);
