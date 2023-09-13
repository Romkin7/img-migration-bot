import { Schema, model } from 'mongoose';
// 1. Create an interface representing a document in MongoDB.
import IProduct from '../types/product.model';

// 2. Create a Schema corresponding to the document interface.
const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: false },
        title: { type: String, required: true },
        alt: { type: String },
        status: { type: String, default: 'available' },
        fullname: { type: String, required: true },
        unit_price: { type: Number, required: true },
        front_page: { type: Boolean, default: false },
        front_page_update: { type: Date },
        year: { type: Number, required: false },
        deliverycost_type: { type: String, default: 'lp' },
        releasedate: { type: Date },
        uri: String,
        /**
         * Use format field instead
         * @deprecated
         * */
        type: { type: String },
        format: { type: String, required: true },
        times_sold: {
            type: Number,
            default: 0 /*this is used to track, how popular product is.*/,
        },
        sizes: [{ size: { type: String }, quantity: { type: Number } }],
        ean: { type: String },
        cover: {
            type: String,
            default: process.env.PRODUCTS_PLACEHOLDER_IMAGE,
        },
        marketplace_buyer: { type: String, default: 'ei ostajaa' },
        marketplace_buyer_reviewed: { type: Boolean, default: false },
        /**
         * Use cover & alt fields instead
         * @deprecated
         * */
        cover_marketplace: {
            public_id: { type: String, default: '' },
            alt: { type: String },
            secure_url: {
                type: String,
                default: process.env.PRODUCTS_PLACEHOLDER_IMAGE,
            },
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        photos: [{ public_id: String, secure_url: String }],
        cover_id: { type: String },
        category: { type: String, required: true },
        description: { type: String },
        additional_info: { type: String },
        edition: { type: String },
        unit_type: { type: String },
        genre: { type: String, default: 'Oheistarvikkeet' },
        label: { type: String },
        tracklist: [String],
        stores: [
            {
                quantity: { type: Number, default: 1 },
                location: String,
            },
        ],
        advance_bookers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        prebookers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Order',
            },
        ],
        marketplace_buyer_user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        total_quantity: { type: Number },
        discountedPrice: { type: Number },
        vat: { type: Number },
        rating: { type: Number, default: 0 },
        reviews: [{ type: String, default: '' }],
        conditionDisk: { type: String, default: 'Uusi Levy' },
        conditionCovers: { type: String, default: 'Uusi Levy' },
        keywords: [String],
    },
    { timestamps: true },
);

productSchema.index({ fullname: 'text' });

productSchema.pre('save', function (next) {
    // Add keywords for the product
    // If you change this, change the keyword finding in search system too
    if (this.category && this.fullname && this.category !== 'marketplace') {
        this.keywords = this.fullname
            .replace(/\&/g, 'and')
            .replace(/[\'\.\"]/g, '')
            .replace(
                /[\!\@\#\$\%\^\&\*\(\)\-\_\=\+\[\]\{\}\\\|\/\?\<\>\,\.\`\~\:\;\'\"]/g,
                ' ',
            )
            .replace(/\s\s+/g, ' ')
            .trim()
            .toLowerCase()
            .split(' ');
    }
    next();
});

//discount rate
productSchema.methods.getDiscountRate = function () {
    return parseFloat(
        String(
            ((this.unit_price - this.discountedPrice) / this.unit_price) * 100,
        ),
    ).toFixed(0);
};

//Reduce quantity
productSchema.methods.reduceQuantity = function (quantity: number) {
    return Math.ceil(this.quantity - quantity);
};

productSchema.index({
    title: 'text',
    name: 'text',
    label: 'text',
    ean: 'text',
    fullname: 'text',
});

// 3. Create a Model.
export default model<IProduct>('Product', productSchema);
