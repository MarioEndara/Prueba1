import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonBadge, IonSpinner, IonItem, IonLabel, 
  IonAlert, ToastController, IonList, IonListHeader, IonImg
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline } from 'ionicons/icons';

import { IncidenciaService } from '../../services/incidencia';
import { SeguimientoService } from '../../services/seguimiento';
import { Incidencia } from '../../models/incidencia.model';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonButton, IonIcon, IonBadge, IonSpinner, IonItem, IonLabel,
    IonAlert, IonList, IonListHeader, IonImg
  ],
})
export class DetallePage implements OnInit {
  private route = inject(ActivatedRoute);
  private incidenciaService = inject(IncidenciaService);
  private seguimientoService = inject(SeguimientoService);
  private toastController = inject(ToastController);

  incidencia: any = null;
  cargando = true;
  errorMensaje = '';
  esSeguimiento = false;
  
  mostrarAlertaResolucion = false;
  alertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { 
      text: 'Guardar', 
      handler: (data: any) => {
        if (!data.observacion || data.observacion.trim() === '') {
          this.mostrarToast('La observación es obligatoria.');
          return false; // No cierra la alerta
        }
        this.confirmarResolucion(data.observacion);
        return true; // Cierra la alerta
      }
    }
  ];

  constructor() {
    addIcons({ bookmark, bookmarkOutline });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Datos fantasma para carga instantánea
      this.incidencia = {
        id: id,
        tipo: 'Cargando...',
        descripcion: '...',
        direccion: '...',
        sector: '...',
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        prioridad: 'media',
        fotografia: '',
        latitud: null,
        longitud: null,
        observacion_resolucion: ''
      };
      this.cargando = false; 
      this.esSeguimiento = await this.seguimientoService.estaEnSeguimiento(id);

      // Traer datos reales
      this.incidenciaService.getIncidencia(id).subscribe({
        next: (data) => { this.incidencia = data; },
        error: (err) => { this.errorMensaje = 'Error al conectar.'; }
      });
    }
  }

  async toggleSeguimiento() {
    if (!this.incidencia) return;
    this.esSeguimiento = await this.seguimientoService.toggleSeguimiento(this.incidencia.id);
    this.mostrarToast(this.esSeguimiento ? 'Añadido a seguimiento' : 'Removido');
  }

  marcarEnProceso() {
    if (!this.incidencia) return;
    this.actualizarEstado('en_proceso', this.incidencia.observacion_resolucion || '');
  }

  pedirResolucion() {
    if (!this.incidencia) return;
    this.mostrarAlertaResolucion = true;
  }

  confirmarResolucion(observacion: string) {
    if (!this.incidencia) return;
    this.actualizarEstado('resuelta', observacion);
  }
    actualizarEstado(nuevoEstado: string, observacion: string) {
    if (!this.incidencia) return;
    
    // Actualizamos la pantalla rápido
    this.incidencia.estado = nuevoEstado;
    if (observacion) this.incidencia.observacion_resolucion = observacion;

    // Solo enviamos los campos que cambian
    const datosActualizados = {
      estado: nuevoEstado,
      observacion_resolucion: observacion || this.incidencia.observacion_resolucion || ''
    };

    this.incidenciaService.actualizarIncidencia(this.incidencia.id, datosActualizados).subscribe({
      next: (data) => {
        this.incidencia = data;
        this.mostrarToast(`¡Actualizado a ${nuevoEstado.replace('_', ' ')}!`);
      },
      error: (err) => {
        // Si falla, imprimimos el error en la consola y en pantalla
        console.error('Error exacto de MockAPI:', err);
        this.mostrarToast('Fallo al actualizar: ' + (err.error?.message || err.message));
        this.ngOnInit(); // Recargamos los datos originales
      }
    });
  }
  
  getColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'primary';
      case 'resuelta': return 'success';
      default: return 'medium';
    }
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 2000, position: 'bottom', color: 'dark' });
    toast.present();
  }
}