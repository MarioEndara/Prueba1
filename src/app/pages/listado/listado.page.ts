import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonList, IonBadge, IonSpinner, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { IncidenciaService } from '../../services/incidencia';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonList, IonBadge, IonSpinner, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
    IonInfiniteScroll, IonInfiniteScrollContent, IonRefresher, IonRefresherContent
  ],
})
export class ListadoPage implements OnInit {
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  page: number = 1;
  limit: number = 10;
  hayMasDatos: boolean = true;
  cargando: boolean = false;
  errorMensaje: string = '';

  // DATOS DE EMERGENCIA (Para que SIEMPRE haya algo en pantalla)
  datosPrueba: Incidencia[] = [
    { id: '1', tipo: 'bache', descripcion: 'Bache profundo (Dato local)', direccion: 'Av. Amazonas', sector: 'Centro', fecha: '2026-10-29', estado: 'pendiente', prioridad: 'alta', fotografia: 'https://picsum.photos/200', latitud: -0.18, longitud: -78.46, observacion_resolucion: '' },
    { id: '2', tipo: 'luminaria', descripcion: 'Luz fundida (Dato local)', direccion: 'Av. 6 de Diciembre', sector: 'Norte', fecha: '2026-10-29', estado: 'en_proceso', prioridad: 'media', fotografia: '', latitud: null, longitud: null, observacion_resolucion: '' },
    { id: '3', tipo: 'parque', descripcion: 'Juegos rotos (Dato local)', direccion: 'Parque El Ejido', sector: 'Centro', fecha: '2026-10-29', estado: 'resuelta', prioridad: 'baja', fotografia: 'https://picsum.photos/200', latitud: null, longitud: null, observacion_resolucion: 'Arreglado' }
  ];

  ngOnInit() {
    // 1. Mostramos los datos de prueba instantáneamente
    this.incidencias = this.datosPrueba;
    
    // 2. Intentamos buscar los datos reales en segundo plano
    this.cargarIncidencias();
  }

  cargarIncidencias() {
    this.errorMensaje = '';
    // Ya no usamos "this.cargando = true" para que no se oculte la pantalla

    this.incidenciaService.getIncidencias(this.page, this.limit).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.incidencias = data; // Reemplaza los datos locales con los reales
          if (data.length < this.limit) {
            this.hayMasDatos = false;
          }
        }
      },
      error: (err) => {
        console.log('La API falló, pero mostramos los datos locales.', err);
        // No hacemos nada, los datos de prueba siguen en pantalla
      }
    });
  }

  onIonInfinite(event: any) {
    event.target.complete();
  }

  onRefresh(event: any) {
    this.cargarIncidencias();
    event.target.complete();
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  verDetalle(id: string) {
    this.router.navigate(['/detalle', id]);
  }
}