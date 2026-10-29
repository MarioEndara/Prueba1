export type EstadoIncidencia = 'pendiente' | 'en_proceso' | 'resuelta';
export type PrioridadIncidencia = 'baja' | 'media' | 'alta';
export type TipoIncidencia =
  | 'bache'
  | 'luminaria'
  | 'senalizacion'
  | 'alcantarilla'
  | 'parque';

export interface Incidencia {
  id: string;
  tipo: TipoIncidencia | string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: EstadoIncidencia | string;
  prioridad: PrioridadIncidencia | string;
  fotografia: string;
  latitud: number | null;
  longitud: number | null;
  observacion_resolucion: string;
}

export interface CrearIncidenciaDto {
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: EstadoIncidencia;
  prioridad: PrioridadIncidencia;
  fotografia: string;
  latitud: number | null;
  longitud: number | null;
  observacion_resolucion: string;
}