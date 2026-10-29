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

  incidencia: any = {
    id: '', tipo: 'Cargando...', descripcion: '...', direccion: '...',
    sector: '...', fecha: new Date().toISOString(), estado: 'pendiente',
    prioridad: 'media', fotografia: '', latitud: null, longitud: null,
    observacion_resolucion: ''
  };
  
  cargando = false; 
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
          return false;
        }
        this.confirmarResolucion(data.observacion);
        return true;
      }
    }
  ];

  constructor() {
    addIcons({ bookmark, bookmarkOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.incidencia.id = id;
      
      // ¡AQUÍ ESTABA EL ERROR! Quitamos el 'await' porque ahora el servicio es instantáneo
      this.esSeguimiento = this.seguimientoService.estaEnSeguimiento(id);

      this.incidenciaService.getIncidencia(id).subscribe({
        next: (data) => { 
          this.incidencia = data; 
          // Volvemos a verificar por si el ID cambió
          this.esSeguimiento = this.seguimientoService.estaEnSeguimiento(this.incidencia.id);
        },
        error: (err) => { 
          this.errorMensaje = 'No se pudo actualizar la información (Mostrando datos en caché).'; 
        }
      });
    }
  }

    toggleSeguimiento() {
    if (!this.incidencia) return;
    
    // Llamamos al servicio que guarda en el localStorage
    this.esSeguimiento = this.seguimientoService.toggleSeguimiento(this.incidencia);
    
    // Mostramos el mensaje para saber que funcionó
    this.mostrarToast(this.esSeguimiento ? '¡Añadido a seguimiento!' : 'Removido');
    
    console.log('Guardado en localStorage:', localStorage.getItem('urban_inspect_seguimientos'));
  }
  marcarEnProceso() {
    if (!this.incidencia.id) return;
    this.actualizarEstado('en_proceso', this.incidencia.observacion_resolucion || '');
  }

  pedirResolucion() {
    if (!this.incidencia.id) return;
    this.mostrarAlertaResolucion = true;
  }

  confirmarResolucion(observacion: string) {
    if (!this.incidencia.id) return;
    this.actualizarEstado('resuelta', observacion);
  }
  actualizarEstado(nuevoEstado: string, observacion: string) {
    if (!this.incidencia.id) return;
    
    const datosActualizados = {
      estado: nuevoEstado,
      observacion_resolucion: observacion || this.incidencia.observacion_resolucion || ''
    };

    this.incidenciaService.actualizarIncidencia(this.incidencia.id, datosActualizados).subscribe({
      next: (data) => {
        // Si la API responde bien, actualizamos la pantalla
        this.incidencia = data;
        this.mostrarToast(`Estado actualizado a ${nuevoEstado.replace('_', ' ')}`);
      },
      error: (err) => {
        // Si la API falla, mostramos el error y no cambiamos nada en pantalla
        console.error(err);
        this.mostrarToast('Error al actualizar en el servidor. Intenta de nuevo.');
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