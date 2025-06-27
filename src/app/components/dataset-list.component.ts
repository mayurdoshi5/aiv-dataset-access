import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Dataset, DatasetListResponse } from '../services/data.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dataset-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dataset-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1 class="main-title">Dataset Explorer</h1>
          <p class="subtitle">Discover and explore available datasets</p>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search datasets by name, description, or type..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input"
          >
        </div>
      </div>

      <!-- Stats Section -->
      <div *ngIf="!loading && !error" class="stats-section">
        <div class="stat-card">
          <div class="stat-number">{{ total }}</div>
          <div class="stat-label">Total Datasets</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ datasets.length }}</div>
          <div class="stat-label">Showing</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalPages }}</div>
          <div class="stat-label">Pages</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading datasets...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 class="error-title">Something went wrong</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" (click)="loadDatasets()">Try Again</button>
      </div>

      <!-- Dataset Grid -->
      <div *ngIf="!loading && !error" class="dataset-grid">
        <div *ngFor="let dataset of datasets" class="dataset-card">
          <div class="card-header">
            <div class="dataset-type-badge" [class]="'type-' + dataset.type.toLowerCase()">
              {{ dataset.type }}
            </div>
            <div class="dataset-actions">
              <button class="action-btn" title="View Details" (click)="getDataForClickedDataset(dataset)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-btn" title="Download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="dataset-name">{{ dataset.name }}</h3>
            <p *ngIf="dataset.description" class="dataset-description">
              {{ dataset.description }}
            </p>
          </div>
          
          <div class="card-footer">
            <div class="dataset-meta">
              <div class="meta-item" *ngIf="dataset.createdAt">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{{ dataset.createdAt | date:'MMM dd, yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && datasets.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3 class="empty-title">No datasets found</h3>
        <p class="empty-message">
          {{ searchQuery ? 'Try adjusting your search terms' : 'There are no datasets available at the moment' }}
        </p>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && !error && totalPages > 1" class="pagination-container">
        <div class="pagination">
          <button 
            [disabled]="currentPage === 1" 
            (click)="changePage(currentPage - 1)"
            class="pagination-btn prev-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Previous
          </button>
          
          <div class="page-numbers">
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <span class="total-info">
              {{ total }} total items
            </span>
          </div>
          
          <button 
            [disabled]="currentPage === totalPages" 
            (click)="changePage(currentPage + 1)"
            class="pagination-btn next-btn"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dataset-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    /* Header Section */
    .header-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding: 40px 20px;
      text-align: center;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .main-title {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-weight: 300;
    }

    /* Search Section */
    .search-section {
      padding: 30px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .search-container {
      position: relative;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: 16px 16px 16px 48px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    /* Stats Section */
    .stats-section {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding: 0 20px 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      min-width: 100px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: white;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: white;
      font-size: 1.1rem;
      margin: 0;
    }

    /* Error State */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .error-icon {
      color: #ef4444;
      margin-bottom: 20px;
    }

    .error-title {
      color: white;
      font-size: 1.5rem;
      margin: 0 0 10px 0;
    }

    .error-message {
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 30px 0;
      max-width: 500px;
    }

    .retry-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .retry-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Dataset Grid */
    .dataset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      padding: 0 20px 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dataset-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .dataset-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 0;
    }

    .dataset-type-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .type-image {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .type-text {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .type-audio {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .type-video {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .type-document {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .dataset-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .card-content {
      padding: 20px;
    }

    .dataset-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }

    .dataset-description {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      padding: 0 20px 20px;
    }

    .dataset-meta {
      display: flex;
      gap: 16px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #9ca3af;
      font-size: 0.875rem;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .empty-icon {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 24px;
    }

    .empty-title {
      color: white;
      font-size: 1.5rem;
      margin: 0 0 12px 0;
    }

    .empty-message {
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      max-width: 400px;
    }

    /* Pagination */
    .pagination-container {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .page-info {
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .total-info {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-title {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .dataset-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 0 16px 32px;
      }

      .stats-section {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .stat-card {
        min-width: 120px;
      }

      .pagination {
        flex-direction: column;
        gap: 16px;
      }

      .page-numbers {
        order: -1;
      }
    }

    @media (max-width: 480px) {
      .header-section {
        padding: 30px 16px;
      }

      .search-section {
        padding: 20px 16px;
      }

      .search-input {
        padding: 14px 14px 14px 44px;
      }
    }
  `]
})
export class DatasetListComponent implements OnInit {
  datasets: Dataset[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  totalPages = 1;
  total = 0;
  searchQuery = '';
  private searchTimeout: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadDatasets();
  }

  loadDatasets() {
    this.loading = true;
    this.error = null;

    this.dataService.getDatasetsFromJson(this.currentPage, 10)
      .subscribe({
        next: (response: DatasetListResponse) => {
          this.datasets = response.datasets;
          this.total = response.total;
          this.totalPages = Math.ceil(this.total / response.limit);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load datasets';
          this.loading = false;
        }
      });
  }

  onSearch() {
    // Debounce search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.performSearch();
    }, 300);
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.loadDatasets();
      return;
    }

    this.loading = true;
    this.error = null;

    this.dataService.searchDatasetsInJson(this.searchQuery, this.currentPage, 10)
      .subscribe({
        next: (response: DatasetListResponse) => {
          this.datasets = response.datasets;
          this.total = response.total;
          this.totalPages = Math.ceil(this.total / response.limit);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to search datasets';
          this.loading = false;
        }
      });
  }

  changePage(page: number) {
    this.currentPage = page;
    if (this.searchQuery.trim()) {
      this.performSearch();
    } else {
      this.loadDatasets();
    }
  }

  getDataForClickedDataset(dataset: Dataset) {
    const url = 'v5/data/dataset/spreview_new';
    const body = {"metaFlag":false,"recordLimit":"-1","lazyLoad":false};

    this.dataService.getFullDatasetData(url, body, {headers: new HttpHeaders({
        id: dataset.id?.toString() || '',
        dc: 'Default',
        owner: 'Admin',
        archievemode: 'false',
        userName: 'Admin',
        category: 'DATASETS',
        timezone: 'SYSTEM',
        vdc: 'Default',
        traceid: 'aiv',
        apitoken: 'eyJhbGciOiJIUzI1NiJ9.eyJkZXBhcnRtZW50IjoiRGVmYXVsdCIsInVzZXJuYW1lIjoiQWRtaW4iLCJzdWIiOiJBZG1pbiIsImlhdCI6MTc1MTAyMjc5MCwiZXhwIjoxNzUxNDU0NzkwfQ.iw6I2RpgYn5Pd_aDqNgDhHCK19yV5IZzEoyMeZ3GqX0'
    })}).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
} 