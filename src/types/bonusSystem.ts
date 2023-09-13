export interface ICoupon {
    createdAt: Date;
    value: 20;
    valid: boolean;
    coupon_id: string;
}

interface IBonusSystem {
    coupons: ICoupon[];
    stamps: number;
    total_price: number;
    upcoming_stamps: number;
}

export default IBonusSystem;
