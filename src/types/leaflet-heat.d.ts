declare module 'leaflet.heat' {
  import { Layer } from 'leaflet';
  
  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
  }
  
  function heatLayer(
    points: [number, number, number][],
    options?: HeatLayerOptions
  ): Layer;
  
  export = heatLayer;
} 