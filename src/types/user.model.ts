import { Schema } from 'mongoose';
import IReview from './review.model';
import IAddress from './address';
import IBonusSystem from './bonusSystem';

export interface IAdmin {
    isAdmin: boolean;
    adminCodeToken?: String;
    adminCodeTokenExpires?: Date;
    premission_level: 'basic' | 'ultimate';
}

export interface IAccount {
    isVerified: boolean;
    verification_pincode: String;
    expires: Date;
}

interface IUser {
    username: string;
    email: string;
    password: string;
    admin: IAdmin;
    bank_account_number?: string;
    reviews: IReview[];
    buyer_reviews: Schema.Types.ObjectId[];
    marketplace_terms_verified: boolean;
    marketplace_products: Schema.Types.ObjectId[];
    completeAddress: IAddress;
    mobileNumber: string;
    can_recieve_emails: boolean;
    name: {
        firstname: String;
        lastname: String;
    };
    fullname: String;
    user: IAccount;
    resetPasswordToken: String;
    resetPasswordExpires: Date;
    created: Date;
    avatar: String;
    contactBy: string;
    bonus_system: IBonusSystem;
    history: Schema.Types.ObjectId[];
}

export default IUser;
