// src/types/react-map-gl.d.ts
declare module 'react-map-gl' {
  export * from 'react-map-gl/dist/esm/types';
  
  import { MarkerProps, PopupProps, NavigationControlProps } from 'react-map-gl/dist/esm/components';
  export const Marker: React.ComponentType<MarkerProps>;
  export const Popup: React.ComponentType<PopupProps>;
  export const NavigationControl: React.ComponentType<NavigationControlProps>;
}

declare module 'react-map-gl/mapbox' {
  import { MapProps } from 'react-map-gl/dist/esm/components/map';
  const Map: React.ComponentType<MapProps>;
  export default Map;
}