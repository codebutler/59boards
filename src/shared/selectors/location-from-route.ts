import { RootState } from '../models/RootState';

const locationFromRoute = (state: RootState): string | undefined => {
    if (state.routing && state.routing.location) {
        const params = new URLSearchParams(state.routing.location.search);
        return params.get('q') || undefined;
    }
    return undefined;
};

export default locationFromRoute;
