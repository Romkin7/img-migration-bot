import { CallbackWithoutResultAndOptionalError, Schema, model } from 'mongoose';
import IDeliveryCost from '../types/deliveryCost.model';

const DeliveryCostSchema = new Schema<IDeliveryCost>({
    name: String,
    variant: String,
    tracking: String,
    formats: { type: [String] },
    format: { type: String, default: 'lp' },
    range: { type: [String] },
    countries: { type: [String] },
    unit_type: {
        type: String,
        default: 'shipping_fee' /* Required by Klarna */,
    },
    unit_price: { type: Number, default: 0 },
    tax_rate: { type: Number, default: 24 },
    unit_price_excluding_tax: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    campaign: { type: Boolean, default: false },
});
DeliveryCostSchema.pre(
    'save',
    function (next: CallbackWithoutResultAndOptionalError) {
        //Calculate tax and unit_price_excluding_tax
        if (this.unit_price > 0) {
            const toFixed = (num: number, fixed: number) => {
                const re = new RegExp(
                    '^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?',
                );
                return num.toString().match(re)[0];
            };
            const unit_price = this.unit_price;
            const tax = toFixed(
                unit_price - unit_price * (10000 / (10000 + 2400)),
                2,
            );
            const unit_price_excluding_tax = toFixed(
                unit_price - Number(tax),
                2,
            );
            // Set then into product then save product
            this.unit_price_excluding_tax = Number(unit_price_excluding_tax);
            this.tax = Number(tax);
        }
        next();
    },
);

DeliveryCostSchema.set('toObject', { virtuals: true });
DeliveryCostSchema.set('toJSON', { virtuals: true });

export default model('DeliveryCost', DeliveryCostSchema);
