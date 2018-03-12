import { CalendarData } from './Calendar';

export default interface District {
    id: number;
    borough: string;
    number: string;
    neighborhoods: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    calendar?: CalendarData;
}
