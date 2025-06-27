import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

// Example interfaces for your data models
export interface Dataset {
  id?: string;
  name: string;
  description?: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
  page: number;
  limit: number;
}

// Interface for the JSON file structure
export interface DatasetJsonItem {
  id: number;
  name: string;
  description: string | null;
  versionNo: number;
  path: string;
  type: string;
  category: string;
  owner: string;
  visibilityType: string;
  visible: number;
  createdBy: string | null;
  createdOn: string;
  isDefault: number;
  lastUpdatedOn: string;
  lastUpdatedBy: string | null;
  absolutePath: string | null;
  outputTypes: string;
  privileges: string | null;
  isArchivable: number;
  isArchived: number;
  isPurgeable: number;
  isPurged: number;
  rootFolder: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private apiService: ApiService) { }

  /**
   * Get all datasets with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Observable of dataset list
   */
  getDatasets(page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    return this.apiService.get(`/v5/datasets?${params.toString()}`);
  }

  /**
   * Get a specific dataset by ID
   * @param id - Dataset ID
   * @returns Observable of dataset
   */
  getDataset(id: string): Observable<Dataset> {
    return this.apiService.get(`/v5/datasets/${id}`);
  }

  /**
   * Create a new dataset
   * @param dataset - Dataset data
   * @returns Observable of created dataset
   */
  createDataset(dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>): Observable<Dataset> {
    return this.apiService.post('/v5/datasets', dataset);
  }

  /**
   * Update an existing dataset
   * @param id - Dataset ID
   * @param dataset - Updated dataset data
   * @returns Observable of updated dataset
   */
  updateDataset(id: string, dataset: Partial<Dataset>): Observable<Dataset> {
    return this.apiService.put(`/v5/datasets/${id}`, dataset);
  }

  /**
   * Delete a dataset
   * @param id - Dataset ID
   * @returns Observable of deletion result
   */
  deleteDataset(id: string): Observable<any> {
    return this.apiService.delete(`/v5/datasets/${id}`);
  }

  /**
   * Search datasets by name or description
   * @param query - Search query
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable of search results
   */
  searchDatasets(query: string, page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    return this.apiService.get(`/v5/datasets/search?${params.toString()}`);
  }

  /**
   * Get datasets by type
   * @param type - Dataset type
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable of filtered datasets
   */
  getDatasetsByType(type: string, page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    return this.apiService.get(`/v5/datasets?${params.toString()}`);
  }

  /**
   * Load datasets from local JSON file
   * @returns Observable of dataset list from JSON file
   */
  loadDatasetsFromJson(): Observable<DatasetListResponse> {
    return this.apiService.get('/assets/json/datasets.json');
  }
  

  /**
   * Convert JSON dataset items to our Dataset interface
   * @param jsonItems - Array of items from JSON file
   * @returns Array of Dataset objects
   */
  private convertJsonToDatasets(jsonItems: DatasetJsonItem[]): Dataset[] {
    return jsonItems.map(item => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description || undefined,
      type: item.type,
      createdAt: item.createdOn ? new Date(item.createdOn) : undefined,
      updatedAt: item.lastUpdatedOn ? new Date(item.lastUpdatedOn) : undefined
    }));
  }

  /**
   * Get datasets from JSON file with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Observable of dataset list
   */
  getDatasetsFromJson(page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    return new Observable(observer => {
      this.loadDatasetsFromJson().subscribe({
        next: (jsonData: any) => {
          const allDatasets = this.convertJsonToDatasets(jsonData).filter(d => d.type !== 'folder');
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedDatasets = allDatasets.slice(startIndex, endIndex);
          
          const response: DatasetListResponse = {
            datasets: paginatedDatasets,
            total: allDatasets.length,
            page: page,
            limit: limit
          };
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Search datasets in JSON file
   * @param query - Search query
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable of search results
   */
  searchDatasetsInJson(query: string, page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    return new Observable(observer => {
      this.loadDatasetsFromJson().subscribe({
        next: (jsonData: any) => {
          const allDatasets = this.convertJsonToDatasets(jsonData);
          const filteredDatasets = allDatasets.filter(dataset => 
            dataset.name.toLowerCase().includes(query.toLowerCase()) ||
            (dataset.description && dataset.description.toLowerCase().includes(query.toLowerCase()))
          );
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedDatasets = filteredDatasets.slice(startIndex, endIndex);
          
          const response: DatasetListResponse = {
            datasets: paginatedDatasets,
            total: filteredDatasets.length,
            page: page,
            limit: limit
          };
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get datasets by type from JSON file
   * @param type - Dataset type
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable of filtered datasets
   */
  getDatasetsByTypeFromJson(type: string, page: number = 1, limit: number = 10): Observable<DatasetListResponse> {
    return new Observable(observer => {
      this.loadDatasetsFromJson().subscribe({
        next: (jsonData: any) => {
          const allDatasets = this.convertJsonToDatasets(jsonData);
          const filteredDatasets = allDatasets.filter(dataset => 
            dataset.type.toLowerCase() === type.toLowerCase()
          );
          
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedDatasets = filteredDatasets.slice(startIndex, endIndex);
          
          const response: DatasetListResponse = {
            datasets: paginatedDatasets,
            total: filteredDatasets.length,
            page: page,
            limit: limit
          };
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Test method to verify proxy is working
   * @returns Observable of test response
   */
  testProxy(): Observable<any> {
    return this.apiService.get('/v5/test');
  }

  getFullDatasetData(url: string, body: any, options: any) {
    // If the URL doesn't start with /v5, add it
    return this.apiService.post(url, body, options);
  }
} 