import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CrearIncidenciaDto, Incidencia } from '../models/incidencia.model';


@Injectable({
  providedIn: 'root'
})
export class IncidenciaService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/incidencias`;

  getIncidencias(page: number, limit: number): Observable<Incidencia[]> {
    return this.http
      .get<Incidencia[]>(`${this.base}?page=${page}&limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getIncidencia(id: string): Observable<Incidencia> {
    return this.http
      .get<Incidencia>(`${this.base}/${id}`)
      .pipe(catchError(this.handleError));
  }

  crearIncidencia(dto: CrearIncidenciaDto): Observable<Incidencia> {
    return this.http
      .post<Incidencia>(this.base, dto)
      .pipe(catchError(this.handleError));
  }
  actualizarIncidencia(id: string, cambios: any): Observable<Incidencia> {
  // Enviamos los headers explícitos para evitar el bloqueo CORS del navegador
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  // Hacemos un PUT (MockAPI prefiere PUT para actualizar)
  return this.http
    .put<Incidencia>(`${this.base}/${id}`, cambios, { headers })
    .pipe(catchError(this.handleError));
  }
  
  private handleError(error: HttpErrorResponse) {
    let mensaje = 'Error de conexión con el servicio.';
    if (error.status === 0) {
      mensaje = 'No se pudo conectar al servicio. Verifique su conexión.';
    } else if (error.status === 404) {
      mensaje = 'El recurso solicitado no existe.';
    } else if (error.status >= 500) {
      mensaje = 'El servicio de oficina presentó un error. Intente más tarde.';
    }
    console.error('API Error:', error);
    return throwError(() => new Error(mensaje));
  }
}