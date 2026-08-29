/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace mappls {
  interface MapOptions {
    center?: [number, number] | { lat: number; lng: number };
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    hybrid?: boolean;
    traffic?: boolean;
    geolocation?: boolean;
    search?: boolean;
    layer?: 'vector' | 'raster';
    [key: string]: any;
  }

  interface MarkerOptions {
    map?: Map;
    position: { lat: number; lng: number } | [number, number];
    icon?: string;
    width?: number;
    height?: number;
    html?: string | HTMLElement;
    popupHtml?: string;
    popupOptions?: any;
    offset?: [number, number];
    draggable?: boolean;
    title?: string;
    [key: string]: any;
  }

  interface PolylineOptions {
    map?: Map;
    paths: Array<{ lat: number; lng: number } | [number, number]>;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    lineGap?: number;
    lineDasharray?: string | number[];
    [key: string]: any;
  }

  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions);
    setCenter(center: [number, number] | { lat: number; lng: number }): void;
    setZoom(zoom: number): void;
    getZoom(): number;
    getCenter(): { lat: number; lng: number };
    fitBounds(bounds: Array<[number, number]> | any, options?: any): void;
    addListener(event: string, callback: (event: any) => void): any;
    removeListener(listener: any): void;
    remove(): void;
    on(event: string, callback: (event: any) => void): void;
    panTo(coords: [number, number] | { lat: number; lng: number }): void;
    flyTo(options: { center: [number, number] | { lat: number; lng: number }; zoom?: number; speed?: number }): void;
    resize(): void;
    [key: string]: any;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setPosition(position: { lat: number; lng: number } | [number, number]): void;
    setIcon(icon: string): void;
    setPopup(html: string): void;
    remove(): void;
    addListener(event: string, callback: (event: any) => void): any;
    [key: string]: any;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setPath(paths: Array<{ lat: number; lng: number } | [number, number]>): void;
    remove(): void;
    [key: string]: any;
  }

  function initialize(key: string, callback?: () => void): void;
}

declare global {
  interface Window {
    mappls?: typeof mappls;
  }
}

export {};
