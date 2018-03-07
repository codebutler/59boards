import { matchPath } from 'react-router';
import { RootState } from '../models/RootState';

interface DistrictIdPathParams {
    selectedDistrictId?: string;
}

const districtIdFromRoute = (state: RootState): number | undefined => {
    if (state.routing && state.routing.location) {
        const match = matchPath<DistrictIdPathParams>(state.routing.location.pathname, {
            path: '/districts/:selectedDistrictId',
            exact: true
        });
        if (match) {
            return parseInt(match.params.selectedDistrictId!, 10);
        }
    }
    return undefined;
};

export default districtIdFromRoute;
