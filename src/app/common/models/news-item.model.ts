import { NewsDate } from "./news-date.model";

export interface NewsItem {
    title: string;
    type: string;
    image: string;
    link?: string;
    dates: NewsDate[];
    description?: string;
}