import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { ApiService } from './services/api.service';
import { HttpHeaders } from '@angular/common/http';
import { DatasetListComponent } from './components/dataset-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DatasetListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'aiv-dataset-access';

  constructor(private apiService: ApiService) {
    
  }

  ngOnInit(): void {
    this.getListOfStaticDatasets();
  }


  private getListOfStaticDatasets() {
    this.apiService.get('assets/json/datasets.json').subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  private getListOFDynamicDatasets() {
    this.apiService.get('v5/api/file', {
      headers: new HttpHeaders({
        dc: 'Default',
        owner: 'Admin',
        archievemode: 'false',
        userName: 'Admin',
        category: 'DATASETS',
        timezone: 'SYSTEM',
        vdc: 'Default',
        traceid: 'aiv',
        apitoken: 'eyJhbGciOiJIUzI1NiJ9.eyJkZXBhcnRtZW50IjoiRGVmYXVsdCIsInVzZXJuYW1lIjoiQWRtaW4iLCJzdWIiOiJBZG1pbiIsImlhdCI6MTc1MTAyMjc5MCwiZXhwIjoxNzUxNDU0NzkwfQ.iw6I2RpgYn5Pd_aDqNgDhHCK19yV5IZzEoyMeZ3GqX0'
      })
    }).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}
