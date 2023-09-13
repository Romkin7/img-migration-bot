import { Schema, Types, model } from 'mongoose';
import IReview from '../types/review.model';

const reviewSchema = new Schema<IReview>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reciever: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        review: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default model('Review', reviewSchema);
