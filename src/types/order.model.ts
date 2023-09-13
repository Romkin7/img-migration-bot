import { Schema } from 'mongoose';
import { StoreLocations } from './store';
import IAddress from './address';
import IItem from './item';
import { ICoupon } from './bonusSystem';

interface IOrder {
    klarna_id?: string;
    paypal_orderID: string;
    checkoutApi_id: string;
    checkoutApi_reference: string;
    paymentInfo: {
        provider: {
            type: String /** klarna, paytrail, paypal, maksu myymälään */;
            required: true;
        };
        providerOrderId: {
            type: String;
            required: false;
        };
        /** Paytrail api reference */
        apiReference: {
            type: String;
            required: false;
        };
    };
    messages: string[];
    items: IItem[];
    client: Schema.Types.ObjectId;
    coupon: ICoupon;
    coupon_id: { type: String; default: null };
    prebook_info: { type: String };
    orderNumber: { type: String };
    payees_information: {
        phone: String;
        email: String;
        firstname: String;
        lastname: String;
        address: IAddress;
    };
    delivery_method: Schema.Types.ObjectId;
    postOffice: {
        id: String;
        name: String;
        zipcode: String;
        address: String;
        city: String;
    };
    itemsToBeReviewed: Schema.Types.ObjectId[];
    parcelNo: string;
    fetchId: string;
    pdfDocumentation: {
        url: string;
        id: string;
    };
    unifaunOrderNo: string;
    pickUpStore: string;
    delivery_store: StoreLocations;
    stamps: number;
    paid: boolean;
    paid_part?: number;
    payment_time: Date;
    status: string; //"pending", "recieved", "done" and "delivered",
    delivered: boolean;
    total_price: number;
    total_taxes: number;
}

export default IOrder;
