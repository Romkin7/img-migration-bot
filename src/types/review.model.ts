import { Types, Schema } from 'mongoose';

export type Ratings = 1 | 2 | 3 | 4 | 5;

interface IReview {
    author: Schema.Types.ObjectId;
    reciever: Schema.Types.ObjectId;
    rating: Ratings;
    review: string;
}

export default IReview;
