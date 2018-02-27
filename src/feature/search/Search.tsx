import flatten, { NestedArray } from 'array-flatten';
import autobind from 'autobind-decorator';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import MapboxClient from 'mapbox';
import { CircularProgress, WithStyles } from 'material-ui';
import MyLocationIcon from 'material-ui-icons/MyLocation';
import SearchIcon from 'material-ui-icons/Search';
import Card, { CardContent } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import InputAdornment from 'material-ui/Input/InputAdornment';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import { Theme, withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import PromisedLocation from 'promised-location';
import PropTypes from 'prop-types';
import React, { Component, CSSProperties, FormEvent } from 'react';
import Autosuggest, {
    ChangeEvent,
    InputProps,
    RenderSuggestionParams,
    RenderSuggestionsContainerParams,
    SuggestionSelectedEventData,
    SuggestionsFetchRequestedParams
} from 'react-autosuggest';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Response } from 'rest';
import { RootAction, selectLocation } from '../../shared/actions';
import { AppContext } from '../app/App';
import { NYC_BOUNDING_BOX, NYC_CENTER } from '../../shared/constants';
import { RootState } from '../../shared/models/RootState';
import Location from '../../shared/models/Location';
import CarmenLocation = mapbox.CarmenLocation;

interface SearchProps {
    selectedLocation: Location;
    onLocationSelected: (location: Location) => void;
}

type ClassKey =
    | 'card'
    | 'container'
    | 'suggestionsContainerOpen'
    | 'suggestion'
    | 'suggestionsList'
    | 'cardContent'
    | 'root'
    | 'gridTextField'
    | 'myLocationAdornment'
    | 'myLocationIcon'
    | 'myLocationProgress';

type PropsWithStyles = SearchProps & WithStyles<ClassKey>;

class Search extends Component<PropsWithStyles> {

    static contextTypes = {
        mapboxClient: PropTypes.instanceOf(MapboxClient).isRequired
    };

    context: AppContext;

    state = {
        inputValue: '',
        location: null,
        suggestions: [],
        isWaitingForLocation: false
    };

    private static getSuggestionValue(suggestion: Location) {
        return suggestion.place_name!;
    }

    private static renderSuggestionsContainer(options: RenderSuggestionsContainerParams) {
        const {containerProps, children} = options;
        return (
            <Paper {...containerProps} square={true}>
                {children}
            </Paper>
        );
    }

    componentWillMount() {
        const selectedLocation = this.props.selectedLocation;
        if (selectedLocation) {
            this.setState({ inputValue: selectedLocation.place_name });
        }
    }

    render() {
        const { classes } = this.props;
        const { inputValue } = this.state;
        return (
            <Autosuggest
                theme={{
                    container: classes.container,
                    suggestionsContainerOpen: classes.suggestionsContainerOpen,
                    suggestionsList: classes.suggestionsList,
                    suggestion: classes.suggestion,
                }}
                renderInputComponent={this.renderInput}
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                onSuggestionSelected={this.onSuggestionSelected}
                renderSuggestionsContainer={Search.renderSuggestionsContainer}
                getSuggestionValue={Search.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                inputProps={{
                    classes,
                    placeholder: 'Enter your address',
                    value: inputValue,
                    onChange: this.onChange,
                }}
            />
        );
    }

    @autobind
    private renderInput(inputProps: InputProps<Location>) {
        const { classes, ref, ...other } = inputProps;
        const {isWaitingForLocation} = this.state;
        return (
            <Card className={classes.card}>
                <CardContent classes={{root: classes.cardContent}}>
                    <Grid container={true} spacing={0} alignItems="center" className={classes.root}>
                        <Grid item={true}>
                            <IconButton color="inherit" aria-label="Menu" disabled={true}>
                                <SearchIcon/>
                            </IconButton>
                        </Grid>
                        <Grid item={true} className={classes.gridTextField}>
                            <TextField
                                fullWidth={true}
                                inputRef={ref}
                                InputProps={{
                                    endAdornment: isWaitingForLocation
                                        ? (
                                            <div className={classes.myLocationProgress}>
                                                <CircularProgress size={18} />
                                            </div>
                                        ) : (
                                            <InputAdornment
                                                position="end"
                                                classes={{root: classes.myLocationAdornment}}
                                            >
                                                <IconButton onClick={this.onMyLocationClicked}>
                                                    <MyLocationIcon
                                                        className={classes.myLocationIcon}
                                                        color="primary"
                                                    />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    disableUnderline: true,
                                    classes: {
                                        input: classes.input,
                                    },
                                    ...other as object,
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }

    @autobind
    private onChange(event: React.FormEvent<object>, { newValue }: ChangeEvent) {
        this.setState({ inputValue: newValue});
    }

    @autobind
    private onSuggestionsFetchRequested({ value }: SuggestionsFetchRequestedParams) {
        this.context.mapboxClient.geocodeForward(value, {
            autocomplete: true,
            bbox: flatten(NYC_BOUNDING_BOX as NestedArray<number>),
            proximity: NYC_CENTER
        })
            .then((res: Response) => {
                const suggestions = res.entity.features
                    .filter((feature: CarmenLocation) => feature.place_type.includes('address'));
                this.setState({ suggestions: suggestions });
            })
            .catch((err: object) => {
                console.error(err);
                this.setState({suggestions: []});
            });
    }

    @autobind
    private onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    @autobind
    private onSuggestionSelected(event: FormEvent<object>, { suggestion }: SuggestionSelectedEventData<Location>) {
        this.props.onLocationSelected(suggestion);
    }

    @autobind
    private onMyLocationClicked() {
        const locator = new PromisedLocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        });

        this.setState({
            isWaitingForLocation: true
        });

        locator
            .then((position) => {
                this.props.onLocationSelected({
                    center: [position.coords.longitude, position.coords.latitude]
                });
            })
            .catch((err) => console.error('failed to get location', err))
            .finally(() => {
                this.setState({
                    isWaitingForLocation: false
                });
            });
    }

    private renderSuggestion(suggestion: Location, { query, isHighlighted }: RenderSuggestionParams) {
        const text = suggestion.place_name!;

        const matches = match(text, query);
        const parts = parse(text, matches);

        return (
            <MenuItem selected={isHighlighted} component="div">
                <div>
                    {parts.map((part, index) => {
                        const style = part.highlight ? { fontWeight: 600 } as CSSProperties : {};
                        return (<span key={String(index)} style={style}>{part.text}</span>);
                    })}
                </div>
            </MenuItem>
        );
    }
}

const styles = (theme: Theme) => ({
    card: { },
    container: { },
    suggestionsContainerOpen: {
        left: 0,
        right: 0,
        marginTop: 0,
        marginBottom: 0
    },
    suggestion: {
        display: 'block',
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    },
    cardContent: {
        padding: 0,
        '&:last-child': {
            paddingBottom: 0,
        }
    },
    root: {
        flexGrow: 1
    },
    gridTextField: {
        flexGrow: 1
    },
    myLocationAdornment: {
        maxHeight: 'inherit'
    },
    myLocationIcon: {
        width: 18,
        height: 18,
        opacity: 0.8
    },
    myLocationProgress: {
        display: 'flex',
        justifyContent: 'center' as 'center',
        alignItems: 'center' as 'center',
        width: 48,
        height: 48
    }
});

const mapStateToProps = (state: RootState) => {
    return {
        selectedLocation: state.selectedLocation
    };
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => {
    return {
        onLocationSelected: (location: Location) => {
            dispatch(selectLocation(location));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)<SearchProps>(Search));
