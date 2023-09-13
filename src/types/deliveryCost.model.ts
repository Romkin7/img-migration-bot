import Countries from './countries';
import { ProductFormats, VatUnits } from './product.model';

export type DeliveryCostNames =
    | 'Nouto myymälästä'
    | 'Postipaketti LP'
    | 'Postipaketti CD'
    | 'singles EU'
    | 'singles World'
    | 'LP 1 - 10 EU1'
    | 'LP 1 - 10 EU2'
    | 'LP 1 - 10 EU3'
    | 'LP 1 - 3 EU4'
    | 'LP 4 - 6 EU4'
    | 'LP 1 - 3 EU5'
    | 'LP 1 - 3 WORLD'
    | 'LP 7 - 10 EU4'
    | 'LP 4 - 6 EU5'
    | 'LP 4 - 6 WORLD'
    | 'LP 7 - 10 EU5'
    | 'LP 7 - 10 WORLD';

export type DeliveryCostVariants =
    | '1-10 LP'
    | "1-1000 LP, CD, 7' singles"
    | "1-2 7' Singels / CD's"
    | '1-3 LP'
    | '4-6 LP'
    | '7-10 LP';

export type DeliveryCostTrackingOptions = 'With tracking' | 'Without tracking';

export type DeliveryCostFormats = "CD,LP,7'" | "CD,7'";

interface IDeliveryCost {
    unit_price: number;
    name: DeliveryCostNames;
    variant: DeliveryCostVariants;
    tracking: DeliveryCostTrackingOptions;
    formats: DeliveryCostFormats[];
    format: ProductFormats;
    range: string[];
    countries: Countries[];
    unit_type: 'shipping_fee';
    tax_rate: VatUnits;
    unit_price_excluding_tax: number;
    tax: number;
    description: string;
    quantity: number;
    campaign: boolean;
}

export default IDeliveryCost;
