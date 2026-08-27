import { ParcelLockerItem } from '../types/transit';

export const INITIAL_PARCEL_ITEMS: ParcelLockerItem[] = [
  {
    id: 'P-9801',
    trackingCode: 'TR-BBS-98012X',
    stationName: 'Master Canteen Central Hub',
    lockerNumber: 'Locker #B-14',
    pin: '8492',
    status: 'ready_pickup',
    recipientName: 'You',
    recipientPhone: '',
    expiryTime: 'In 18 hours',
  },
  {
    id: 'P-9802',
    trackingCode: 'TR-BBS-44122Y',
    stationName: 'Patia / KIIT University Hub',
    lockerNumber: 'Locker #P-08',
    pin: '1093',
    status: 'in_transit',
    recipientName: 'Priyanka Dash',
    recipientPhone: '+91 91234 56780',
    expiryTime: 'Arriving on Mo Bus #10 in 12 mins',
  },
];
