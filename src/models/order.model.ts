import { Schema, model } from 'mongoose';
import { VatUnits } from '../types/product.model';
import IOrder from '../types/order.model';
import IDeliveryCost from '../types/deliveryCost.model';
import IItem from '../types/item';
import reducer from '../utils/reducer';

const orderSchema = new Schema<IOrder>(
    {
        klarna_id: { type: String },
        // Paypal order tokens
        paypal_orderID: { type: String },
        checkoutApi_id: { type: String },
        checkoutApi_reference: { type: String },
        paymentInfo: {
            provider: {
                type: String /** klarna, paytrail, paypal, maksu myymälään */,
                required: true,
            },
            providerOrderId: {
                type: String,
                required: false,
            },
            /** Paytrail api reference */
            apiReference: {
                type: String,
                required: false,
            },
        },
        messages: [String],
        items: [
            {
                item: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                },
                paid: { type: Boolean, default: false },
                ready: { type: Boolean, default: false },
                delivered: { type: Boolean, default: false },
                category: { type: String, required: true },
                type: { type: String },
                genre: { type: String, required: true },
                pickable: { type: Boolean, default: false },
                fullname: { type: String, required: true },
                quantity: { type: Number, default: 0 },
                unit_price: { type: Number, default: 0 },
                tax_amount: { type: Number, default: 0 },
                tax_rate: { type: Number, default: 24 },
                unit_price_excluding_tax: { type: Number, default: 0 },
                size: { type: String }, // used with T-Skirts
            },
        ],
        client: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        coupon: {
            coupon_id: { type: String, default: null },
            coupon_value: { type: Number, default: 20 },
        },
        coupon_id: { type: String, default: null },
        prebook_info: { type: String },
        orderNumber: { type: String },
        payees_information: {
            phone: String,
            email: String,
            firstname: String,
            lastname: String,
            address: {
                street: String,
                zip: String,
                city: String,
                country: { type: String, default: 'Finland' },
            },
        },
        delivery_method: {
            type: Schema.Types.ObjectId,
            ref: 'DeliveryCost',
        },
        postOffice: {
            id: String,
            name: String,
            zipcode: String,
            address: String,
            city: String,
        },
        itemsToBeReviewed: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        parcelNo: { type: String },
        fetchId: { type: String },
        pdfDocumentation: {
            url: { type: String },
            id: { type: String },
        },
        unifaunOrderNo: { type: String },
        pickUpStore: { type: String },
        delivery_store: { type: String, default: 'Helsinki, Sörnäinen' },
        stamps: { type: Number },
        paid: { type: Boolean },
        paid_part: { type: Number, default: 0 },
        payment_time: { type: Date, default: Date.now },
        status: { type: String }, //"pending", "recieved", "done" and "delivered",
        delivered: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

orderSchema.virtual('total_quantity').get(function () {
    const quantities: number[] = this.items.map(
        (item) => item.quantity as unknown as number,
    );
    const reducer = (accumulator: number, currentValue: number) =>
        accumulator + currentValue;
    return quantities.reduce(reducer);
});

orderSchema.virtual('total_taxes').get(function () {
    function getTaxes(totalPrice: number, vat: VatUnits) {
        const tax = (totalPrice / 100) * vat;
        return tax;
    }
    const deliveryPricesTax: number = Number(
        (this.delivery_method as unknown as IDeliveryCost).tax,
    );
    const itemsTotalPrices = (this.items as unknown as IItem[]).map(
        (item: IItem) => {
            const totalPrice = item.unit_price * item.quantity;
            return getTaxes(totalPrice, item.tax_rate);
        },
    );
    const reducer = (accumulator: number, currentValue: number) =>
        accumulator + currentValue;
    const sum = itemsTotalPrices.reduce(reducer);
    if (this.postOffice.id) {
        return sum + deliveryPricesTax;
    } else {
        return sum;
    }
});

orderSchema.virtual('total_price_excluding_tax').get(function () {
    return this.total_price - this.total_taxes;
});

orderSchema.virtual('final_price').get(function () {
    const deliveryPrice: number = this.delivery_method
        ? Number((this.delivery_method as unknown as IDeliveryCost).unit_price)
        : 0;
    const itemsTotalPrices = (this.items as unknown as IItem[]).map(
        (item: IItem) =>
            item.quantity * (item.unit_price ? item.unit_price : 0),
    );

    if (itemsTotalPrices.length) {
        const sum = itemsTotalPrices.reduce(reducer);
        if (this.postOffice.id && this.coupon.coupon_id) {
            return sum + deliveryPrice - 20;
        } else if (
            this.postOffice.id ||
            this.payees_information.address.country !== 'Finland'
        ) {
            return sum + deliveryPrice;
        } else if (this.coupon.coupon_id) {
            return sum + deliveryPrice - 20;
        } else {
            return sum;
        }
    } else {
        return 0;
    }
});

orderSchema.virtual('total_price').get(function () {
    const deliveryPrice: number = this.delivery_method
        ? Number((this.delivery_method as unknown as IDeliveryCost).unit_price)
        : 0;
    const itemsTotalPrices = (this.items as unknown as IItem[]).map(
        (item: IItem) =>
            item.quantity * (item.unit_price ? item.unit_price : 0),
    );
    if (itemsTotalPrices.length) {
        const sum = itemsTotalPrices.reduce(reducer);
        if (
            this.postOffice.id ||
            this.payees_information.address.country !== 'Finland'
        ) {
            return sum + deliveryPrice;
        } else {
            return sum;
        }
    } else {
        return 0;
    }
});

orderSchema.virtual('unpaid_part').get(function () {
    const deliveryPrice: number = Number(
        (this.delivery_method as unknown as IDeliveryCost).unit_price,
    );
    const itemsTotalPrices = (this.items as unknown as IItem[])
        .filter((item: IItem) => {
            if (item.paid === false) {
                return item;
            }
        })
        .map(function (item: IItem) {
            return item.unit_price;
        });
    if (itemsTotalPrices.length) {
        const sum = itemsTotalPrices.reduce(reducer);
        if (this.klarna_id && this.coupon.coupon_id) {
            return sum + deliveryPrice - 20;
        } else if (this.klarna_id) {
            return sum + deliveryPrice;
        } else {
            return sum;
        }
    } else {
        return 0;
    }
});

export default model('Order', orderSchema);
