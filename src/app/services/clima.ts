import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';

  getClima(lat: number, lon: number): Observable<any> {
    // Open-Meteo: pedimos temperatura actual, precipitación y código de clima
    const url = `${this.baseUrl}?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code`;
    return this.http.get(url).pipe(
      catchError((error) => {
        console.error('Error API Clima:', error);
        return throwError(() => new Error('No se pudo obtener el clima.'));
      })
    );
  }

  getDescripcionClima(code: number): string {
    const codigos: { [key: number]: string } = {
      0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
      45: 'Niebla', 48: 'Niebla con escarcha', 51: 'Llovizna ligera', 53: 'Llovizna moderada',
      55: 'Llovizna densa', 61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia fuerte',
      80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos violentos',
      95: 'Tormenta', 96: 'Tormenta con granizo'
    };
    return codigos[code] || 'Condición desconocida';
  }
}