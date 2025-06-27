import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';
import { DataService } from './data.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    ApiService,
    DataService
  ],
  exports: []
})
export class ServicesModule { }

// Export all services for easy importing
export { ApiService } from './api.service';
export type { ApiResponse, HttpOptions } from './api.service';
export { DataService } from './data.service';
export type { Dataset, DatasetListResponse } from './data.service'; 