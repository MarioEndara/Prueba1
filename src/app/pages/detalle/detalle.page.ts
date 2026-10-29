import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonBadge, IonSpinner, IonItem, IonLabel, 
  IonTextarea, IonAlert, ToastController, IonList, IonListHeader, IonImg
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, bookmarkOutline, createOutline } from 'ionicons/icons';

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
    IonTextarea, IonAlert, IonList, IonListHeader, IonImg
  ],
})
export class DetallePage implements OnInit {
  private route = inject(ActivatedRoute);
  private incidenciaService = inject(IncidenciaService);
  private seguimientoService = inject(SeguimientoService);
  private toastController = inject(ToastController);

  incidencia: Incidencia | null = null;
  cargando = true;
  esSeguimiento = false;
  
  // Para la alerta de resolución
  mostrarAlertaResolucion = false;
  observacionResolucion = '';
  alertButtons = [
    { text: 'Cancelar', role: 'cancel' },
    { 
      text: 'Guardar', 
      handler: (data: any) => {
        if (!data.observacion || data.observacion.trim() === '') {
          this.mostrarToast('La observación es obligatoria para resolver.');
          return false; // Evita que se cierre la alerta
        }
        this.confirmarResolucion(data.observacion);
        return true;
      }
    }
  ];

  constructor() {
    addIcons({ bookmark, bookmarkOutline, createOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalle(id);
    }
  }

  cargarDetalle(id: string) {
    this.incidenciaService.getIncidencia(id).subscribe({
      next: async (data) => {
        this.incidencia = data;
        this.esSeguimiento = await this.seguimientoService.estaEnSeguimiento(id);
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarToast(err.message);
        this.cargando = false;
      }
    });
  }

  async toggleSeguimiento() {
    if (!this.incidencia) return;
    this.esSeguimiento = await this.seguimientoService.toggleSeguimiento(this.incidencia.id);
    const msg = this.esSeguimiento ? 'Añadido a seguimiento' : 'Removido de seguimiento';
    this.mostrarToast(msg);
  }

  // R9: Cambiar a "en_proceso"
  marcarEnProceso() {
    if (!this.incidencia || this.incidencia.estado === 'resuelta') return;
    this.actualizarEstado('en_proceso', this.incidencia.observacion_resolucion);
  }

  // R9: Mostrar alerta para pedir observación antes de resolver
  pedirResolucion() {
    if (!this.incidencia || this.incidencia.estado === 'resuelta') return;
    this.observacionResolucion = this.incidencia.observacion_resolucion || '';
    this.mostrarAlertaResolucion = true;
  }

  confirmarResolucion(observacion: string) {
    if (!this.incidencia) return;
    this.actualizarEstado('resuelta', observacion);
  }

  actualizarEstado(nuevoEstado: string, observacion: string) {
    if (!this.incidencia) return;
    
    const cambios = {
      estado: nuevoEstado,
      observacion_resolucion: observacion || ''
    };

    this.incidenciaService.actualizarIncidencia(this.incidencia.id, cambios).subscribe({
      next: (data) => {
        this.incidencia = data;
        this.mostrarToast(`Estado actualizado a ${nuevoEstado}`);
      },
      error: (err) => this.mostrarToast(err.message)
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
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}