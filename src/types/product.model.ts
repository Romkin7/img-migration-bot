import { Types, Schema } from 'mongoose';
import ISize from './size';
import IStore from './store';

export type ProductAvailabilityStatuses = 'available' | 'archived';

export type ProductDeliveryCostTypes = 'lp' | 'cd';

export type ProductFormats =
    | ProductDeliveryCostTypes
    | '7-Tuumaiset'
    | '12-Tuumaiset'
    | 'Lahjakortit'
    | 'Kasetti'
    | 'muut';

export type Genres =
    | 'Rock'
    | 'Kotimainen'
    | 'Svart-records'
    | 'Punk-hardcore'
    | 'Blues'
    | 'Jazz'
    | 'Funk-soul'
    | 'Heavy-metal'
    | 'Indie-alternative'
    | 'Rock-roll'
    | 'HipHop'
    | 'Electronic'
    | 'Folk-country'
    | 'Reggae'
    | 'Soundtrack'
    | 'Oheistarvikkeet'
    | 'Kirjat'
    | 'T-Paidat';

export type Categories =
    | 'Uudet'
    | 'Tilattavat'
    | 'Tulevat'
    | 'Tarjous'
    | 'Tarjoukset'
    | 'Käytetyt'
    | 'Oheistarvikkeet'
    | 'T-Paidat'
    | 'Lahjakortit'
    | 'marketplace'
    | 'Kauppapaikka';

export type ConditionTypes =
    | 'VG'
    | 'VG+'
    | 'EX-'
    | 'EX'
    | 'EX+'
    | 'NEARMINT'
    | 'Uusi Levy';

export type VatUnits = 24 | 10 | 0;

interface IProduct {
    title: string;
    email: string;
    name?: string;
    fullname: string;
    unit_price: number;
    front_page: boolean;
    front_page_update: Date;
    year?: number;
    deliverycost_type: ProductDeliveryCostTypes;
    uri: string;
    /**
     * Use format field instead
     * @deprecated
     * */
    type: ProductFormats;
    format: ProductFormats;
    releasedate?: Date;
    cover: string;
    alt: string;
    status: ProductAvailabilityStatuses;
    times_sold: number;
    sizes?: ISize[];
    ean: string;
    marketplace_buyer?: string;
    marketplace_buyer_reviewed?: boolean;
    /**
     * Use cover & alt fields instead
     * @deprecated
     * */
    cover_marketplace?: {
        public_id: string;
        alt: string;
        secure_url: string;
    };
    order: Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId;
    photos: [{ public_id: String; secure_url: String }];
    /**
     * Use alt instead
     * @deprecated
     */
    cover_id: string;
    category: Categories;
    description?: string;
    additional_info?: string;
    edition: string;
    unit_type: string;
    genre: Genres;
    label: string;
    tracklist?: string[];
    stores: IStore[];
    advance_bookers?: Schema.Types.ObjectId[];
    prebookers?: Schema.Types.ObjectId[];
    marketplace_buyer_user?: Schema.Types.ObjectId;
    total_quantity: number;
    discountedPrice: number;
    vat: number;
    rating: number;
    reviews: string[];
    conditionDisk: ConditionTypes;
    conditionCovers: ConditionTypes;
    keywords: string[];
}

export default IProduct;
