import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService { // Zmieniłem nazwę na DataService dla czytelności
  // Upewnij się, że plik JSON jest w public/data/points.json lub src/assets/data/points.json
  private jsonUrl = 'static_all_points.json';

  constructor(private http: HttpClient) { }

  getPoints(): Observable<any> {
    return this.http.get<any[]>(this.jsonUrl).pipe(
      map(response => {
        // Twoja struktura to tablica, w której pierwszy element
        // zawiera obiekt "json_build_object"
        if (response && response.length > 0) {
          return response[0].json_build_object;
        }
        return null;
      })
    );
  }
}
