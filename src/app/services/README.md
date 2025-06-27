# Services Documentation

This directory contains services for making REST API calls to the AIV marketplace.

## Services Overview

### ApiService
A generic HTTP service that provides methods for making REST calls to the AIV API.

### DataService
A specific service for handling dataset operations, built on top of the ApiService.

## Usage Examples

### Basic API Service Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-example',
  template: '<div>{{ data | json }}</div>'
})
export class ExampleComponent implements OnInit {
  data: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // GET request
    this.apiService.get('/some-endpoint')
      .subscribe({
        next: (response) => {
          this.data = response;
          console.log('Data received:', response);
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });

    // POST request
    const newData = { name: 'Test', value: 123 };
    this.apiService.post('/some-endpoint', newData)
      .subscribe({
        next: (response) => {
          console.log('Created:', response);
        },
        error: (error) => {
          console.error('Error:', error);
        }
      });
  }
}
```

### Data Service Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { DataService, Dataset } from './services/data.service';

@Component({
  selector: 'app-datasets',
  template: `
    <div *ngFor="let dataset of datasets">
      <h3>{{ dataset.name }}</h3>
      <p>{{ dataset.description }}</p>
    </div>
  `
})
export class DatasetsComponent implements OnInit {
  datasets: Dataset[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Get datasets with pagination
    this.dataService.getDatasets(1, 10)
      .subscribe({
        next: (response) => {
          this.datasets = response.datasets;
        },
        error: (error) => {
          console.error('Error fetching datasets:', error);
        }
      });
  }

  createDataset() {
    const newDataset = {
      name: 'New Dataset',
      description: 'A new dataset',
      type: 'csv'
    };

    this.dataService.createDataset(newDataset)
      .subscribe({
        next: (response) => {
          console.log('Dataset created:', response);
          // Refresh the list
          this.ngOnInit();
        },
        error: (error) => {
          console.error('Error creating dataset:', error);
        }
      });
  }
}
```

### Authentication

```typescript
// Set authentication token
this.apiService.setAuthToken('your-jwt-token');

// Remove authentication token
this.apiService.removeAuthToken();

// Add custom headers
this.apiService.addHeader('X-Custom-Header', 'custom-value');
```

### Error Handling

The services include built-in error handling with retry logic. Errors are automatically logged to the console and can be handled in the subscription:

```typescript
this.apiService.get('/endpoint')
  .subscribe({
    next: (response) => {
      // Handle success
    },
    error: (error) => {
      // Handle error
      console.error('API Error:', error.message);
      // Show user-friendly error message
    }
  });
```

## API Endpoints

The services are configured to work with the AIV marketplace API at:
- Base URL: `/v5` (proxied to `https://marketplace.aivhub.com:8081/aiv/`)

### Available Endpoints (examples)
- `GET /datasets` - Get all datasets
- `GET /datasets/{id}` - Get specific dataset
- `POST /datasets` - Create new dataset
- `PUT /datasets/{id}` - Update dataset
- `DELETE /datasets/{id}` - Delete dataset
- `GET /datasets/search?q={query}` - Search datasets

## Configuration

The services are automatically configured with:
- Default headers: `Content-Type: application/json`, `Accept: application/json`
- Retry logic: 1 retry on failure
- Error handling with detailed error messages
- Proxy configuration for development

## Best Practices

1. **Always handle errors** in your subscriptions
2. **Use TypeScript interfaces** for type safety
3. **Implement loading states** for better UX
4. **Use proper error boundaries** in components
5. **Cache responses** when appropriate
6. **Handle authentication** properly
7. **Use pagination** for large datasets

## Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
``` 