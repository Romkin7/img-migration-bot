import bcrypt from 'bcrypt';
import Order from './order.model';
import { Schema, Types, model } from 'mongoose';
import reducer from '../utils/reducer';
import IUser from '../types/user.model';
import IReview, { Ratings } from '../types/review.model';
import IItem from '../types/item';
import IOrder from '../types/order.model';
import { AnyArn } from 'aws-sdk/clients/groundstation';

const UserSchema = new Schema<IUser>(
    {
        admin: {
            isAdmin: { type: Boolean, default: false },
            adminCodeToken: String,
            adminCodeTokenExpires: Date,
            premission_level: { type: String, default: 'basic' },
        },
        bank_account_number: { type: String, default: '' },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review',
            },
        ],
        buyer_reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review',
            },
        ],
        marketplace_terms_verified: { type: Boolean, default: false },
        marketplace_products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        completeAddress: {
            zipcode: { type: String, default: '' },
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            country: { type: String, default: 'Finland', required: true },
        },
        mobileNumber: { type: String, default: '' },
        email: { type: String, unique: true, lowercase: true, required: true },
        can_recieve_emails: { type: Boolean, default: false },
        name: {
            firstname: String,
            lastname: String,
        },
        fullname: String,
        user: {
            isVerified: { type: Boolean, default: false },
            verification_pincode: String,
            expires: { type: Date },
        },
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true, select: false },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        created: { type: Date, default: Date.now },
        avatar: String,
        contactBy: { type: String },
        bonus_system: {
            coupons: [
                {
                    createdAt: { type: Date, default: Date.now },
                    value: { type: Number, default: 20 },
                    valid: { type: Boolean, default: false },
                },
            ],
            total_price: { type: Number, default: 0 },
            stamps: { type: Number, default: 0 },
            upcoming_stamps: { type: Number, default: 0 },
        },
        history: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Order',
            },
        ],
    },
    {
        timestamps: true,
    },
);

// Hash the password before saving it to the database
UserSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.getFullName = function () {
    return this.name.firstname + ' ' + this.name.lastname;
};

//compare password in the database and the one that the user types in
UserSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

//Admin premissions
UserSchema.methods.confirmAdminLevel = () => {
    if (
        ((this as unknown as IUser)?.admin.isAdmin &&
            (this as unknown as IUser)?.admin.premission_level === 'basic') ||
        ((this as unknown as IUser)?.admin.isAdmin &&
            (this as unknown as IUser)?.admin.premission_level === 'ultimate' &&
            (this as unknown as IUser)?.admin.premission_level)
    ) {
        return true;
    } else {
        return false;
    }
};

UserSchema.virtual('total_rating').get(function () {
    const ratings = this.reviews.map((review) => {
        return review.rating;
    });

    if (ratings.length) {
        const sum: number = (ratings as unknown as number[]).reduce(reducer);
        return parseFloat(String(sum / this.reviews.length)).toFixed(1);
    } else {
        return 0;
    }
});

UserSchema.virtual('total_rating2').get(function () {
    const ratings = this.buyer_reviews.map((review) => {
        return (review as unknown as IReview).rating;
    });
    if (ratings.length) {
        const sum: number = (ratings as unknown as number[]).reduce(reducer);
        return parseFloat(String(sum / this.buyer_reviews.length)).toFixed(1);
    } else {
        return 0;
    }
});

UserSchema.virtual('total_counts_rating').get(function () {
    const one: Ratings[] = this.reviews
        .filter((review) => {
            if (review.rating === 1) {
                return review;
            }
        })
        .map((review) => {
            return review.rating;
        });
    const three: Ratings[] = this.reviews
        .filter((review) => {
            if (review.rating === 3) {
                return review;
            }
        })
        .map((review) => {
            return review.rating;
        });
    const five: Ratings[] = this.reviews
        .filter((review) => {
            if (review.rating === 5) {
                return review;
            }
        })
        .map((review) => {
            return review.rating;
        });
    return {
        one: one.length,
        three: three.length,
        five: five.length,
    };
});

UserSchema.virtual('total_counts_rating2').get(function () {
    const one: Ratings[] = this.buyer_reviews
        .filter((review) => {
            if ((review as unknown as IReview).rating === 1) {
                return review;
            }
        })
        .map((review) => {
            return (review as unknown as IReview).rating;
        });
    const three: Ratings[] = this.buyer_reviews
        .filter((review) => {
            if ((review as unknown as IReview).rating === 3) {
                return review;
            }
        })
        .map((review) => {
            return (review as unknown as IReview).rating;
        });
    const five: Ratings[] = this.buyer_reviews
        .filter((review) => {
            if ((review as unknown as IReview).rating === 5) {
                return review;
            }
        })
        .map((review) => {
            return (review as unknown as IReview).rating;
        });
    return {
        one: one.length,
        three: three.length,
        five: five.length,
    };
});

UserSchema.virtual('total_rating_percent').get(function () {
    const ratings = this.reviews.map((review) => {
        return review.rating;
    });
    const sum: number = (ratings as unknown as number[]).reduce(reducer);
    return parseFloat(String((sum / this.reviews.length / 5) * 100)).toFixed(2);
});

UserSchema.methods.get_product_count = async function (item_id: string) {
    const orders: IOrder[] = await Order.find({ _id: { $in: this.history } });
    const items: IItem[][] = orders.map((order) => {
        return order.items;
    });
    const flatten: (items: IItem[][]) => IItem[] = (items: IItem[][]) => {
        return items.reduce(
            (a: IItem[], b: IItem[][] | IItem[]) =>
                a.concat(
                    Array.isArray(b) ? flatten(b as unknown as IItem[][]) : b,
                ),
            [],
        );
    };
    const flattedItems = flatten(items);
    const count = flattedItems.map((item: IItem) => {
        return (item.item as unknown as Types.ObjectId).equals(item_id);
    });
    return count.length;
};

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ created: 1 });
UserSchema.index({ email: 'text', username: 'text', fullname: 'text' });

export default model('User', UserSchema);
