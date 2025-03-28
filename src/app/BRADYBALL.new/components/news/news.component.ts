// news.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { NewsItem } from '../../../common/models/news-item.model';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
    newsItems: NewsItem[] = [];

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.loadNewsItems();
    }

    loadNewsItems(): void {
        this.dataService.getNewsItems().subscribe(
            (data: NewsItem[]) => {
                this.newsItems = data;
            },
            error => {
                console.error('Error fetching news items:', error);
            }
        );
    }
}