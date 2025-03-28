import { Component, Input } from '@angular/core';
import { NewsItem } from '../../../common/models/news-item.model';

@Component({
    selector: 'app-news-item',
    templateUrl: './news-item.component.html',
    styleUrls: ['./news-item.component.scss']
})
export class NewsItemComponent {
    @Input() newsItem: NewsItem | undefined;
}