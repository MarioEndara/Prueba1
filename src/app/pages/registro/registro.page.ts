import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonButton, IonIcon, IonList, IonSpinner, ToastController, AlertController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { addIcons } from 'ionicons';
import { cameraOutline, locationOutline, saveOutline, cloudOutline } from 'ionicons/icons';

import { IncidenciaService } from '../../services/incidencia';
import { CrearIncidenciaDto } from '../../models/incidencia.model';
import { ClimaService } from '../../services/clima';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea,
    IonButton, IonIcon, IonList, IonSpinner
  ],
})
export class RegistroPage implements OnInit {
    private CLOUDINARY_CLOUD_NAME = 'Mario'; // <-- Cámbialo por el tuyo
  private CLOUDINARY_PRESET = 'prueba1'; // El nombre que le pusiste al preset
  private incidenciaService = inject(IncidenciaService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  public climaService = inject(ClimaService); // Público para usarlo en el HTML

  incidencia: CrearIncidenciaDto = {
    tipo: '',
    descripcion: '',
    direccion: '',
    sector: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    prioridad: 'media',
    fotografia: '',
    latitud: null,
    longitud: null,
    observacion_resolucion: ''
  };

  fotoCapturada: string | null = null;
  cargandoUbicacion = false;
  guardando = false;
  readonly KEY_BORRADOR = 'borrador_incidencia';

  // Variables para el clima
  datosClima: any = null;
  errorClima: string = '';

  constructor() {
    addIcons({ cameraOutline, locationOutline, saveOutline, cloudOutline });
  }

  async ngOnInit() {
    await this.verificarBorrador();
  }

  async verificarBorrador() {
    const { value } = await Preferences.get({ key: this.KEY_BORRADOR });
    if (value) {
      const alert = await this.alertController.create({
        header: 'Registro incompleto',
        message: 'Se encontró un borrador de un registro anterior. ¿Deseas continuar o descartarlo?',
        buttons: [
          {
            text: 'Descartar',
            role: 'cancel',
            handler: async () => {
              await Preferences.remove({ key: this.KEY_BORRADOR });
            }
          },
          {
            text: 'Continuar',
            handler: () => {
              const borrador = JSON.parse(value);
              this.incidencia = borrador.incidencia;
              this.fotoCapturada = borrador.fotoCapturada;
            }
          }
        ]
      });
      await alert.present();
    }
  }

  async guardarBorrador() {
    const borrador = {
      incidencia: this.incidencia,
      fotoCapturada: this.fotoCapturada
    };
    await Preferences.set({ key: this.KEY_BORRADOR, value: JSON.stringify(borrador) });
  }

  async obtenerUbicacion() {
    this.cargandoUbicacion = true;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.incidencia.latitud = coordinates.coords.latitude;
      this.incidencia.longitud = coordinates.coords.longitude;
      this.mostrarToast('Ubicación obtenida correctamente');
      this.guardarBorrador();
    } catch (error) {
      console.error('Error GPS:', error);
      this.mostrarToast('No se pudo obtener el GPS. Ingresa coordenadas manuales.');
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      this.fotoCapturada = image.dataUrl || null;
      this.mostrarToast('Foto capturada. Recuerda guardar.');
      this.guardarBorrador();
    } catch (error) {
      console.error('Error cámara:', error);
    }
  }

  // Lógica del Clima (R4)
  consultarClima() {
    if (this.incidencia.latitud === null || this.incidencia.longitud === null) {
      this.mostrarToast('Primero debes obtener la ubicación (GPS o manual).');
      return;
    }

    this.errorClima = '';
    this.datosClima = null;

    this.climaService.getClima(this.incidencia.latitud, this.incidencia.longitud).subscribe({
      next: (res) => {
        this.datosClima = res.current;
      },
      error: (err) => {
        this.errorClima = err.message;
      }
    });
  }

    async guardarIncidencia() {
    if (!this.incidencia.tipo || !this.incidencia.descripcion || !this.incidencia.direccion || !this.incidencia.sector) {
      this.mostrarToast('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (this.incidencia.prioridad === 'alta' && !this.fotoCapturada) {
      this.mostrarToast('La prioridad ALTA exige una fotografía obligatoria.');
      return;
    }

    if (this.incidencia.tipo === 'bache' && (this.incidencia.latitud === null || this.incidencia.longitud === null)) {
      this.mostrarToast('Para baches, la ubicación (GPS o manual) es obligatoria.');
      return;
    }

    this.guardando = true;

    try {
      // Si hay foto, la subimos a Cloudinary primero
      if (this.fotoCapturada) {
        this.mostrarToast('Subiendo fotografía...');
        
        const formData = new FormData();
        // Convertimos la imagen Base64 a un archivo para enviarlo
        const blob = this.base64ToBlob(this.fotoCapturada);
        formData.append('file', blob);
        formData.append('upload_preset', this.CLOUDINARY_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (data.secure_url) {
          this.incidencia.fotografia = data.secure_url; // ¡URL real de internet!
        } else {
          throw new Error('No se pudo obtener la URL de la imagen');
        }
      }

      // Ahora guardamos la incidencia con la URL de Cloudinary
      this.incidenciaService.crearIncidencia(this.incidencia).subscribe({
        next: async () => {
          this.guardando = false;
          await Preferences.remove({ key: this.KEY_BORRADOR });
          this.mostrarToast('Incidencia guardada correctamente');
          this.router.navigate(['/listado']);
        },
        error: (err) => {
          this.guardando = false;
          this.mostrarToast('Error al guardar: ' + err.message);
        }
      });

    } catch (error) {
      this.guardando = false;
      console.error(error);
      this.mostrarToast('Error al subir la imagen. Guardando sin foto...');
      
      // Si falla Cloudinary, guardamos sin foto para no perder el registro
      this.incidencia.fotografia = '';
      this.incidenciaService.crearIncidencia(this.incidencia).subscribe({
        next: () => {
          this.router.navigate(['/listado']);
        }
      });
    }
  }

  // Función auxiliar para convertir el texto Base64 a un archivo real
  base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}