import { Schema, Types } from 'mongoose';
import IProduct, {
    Categories,
    Genres,
    ProductFormats,
    VatUnits,
} from './product.model';
import { Sizes } from './size';

interface IItem {
    unit_price: number;
    category: Categories;
    genre: Genres;
    tax_rate: VatUnits;
    tax_amount: number;
    unit_price_excluding_tax: number;
    size?: Sizes;
    name?: string;
    title: string;
    fullname: string;
    quantity: number;
    paid: boolean;
    delivered: boolean;
    ready: boolean;
    pickable: boolean;
    type: ProductFormats;
    item: IProduct | Schema.Types.ObjectId | Types.ObjectId;
}

export default IItem;
