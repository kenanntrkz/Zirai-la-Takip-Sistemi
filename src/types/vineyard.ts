export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Vineyard {
  id: string;
  name: string;
  area: number; // metrekare cinsinden
  parcelInfo: {
    ada: string;
    parcel: string;
  };
  coordinates: Coordinates[];
  grapeType: string;
  createdAt: string;
  updatedAt: string;
}

export interface VineyardFormData extends Omit<Vineyard, 'id' | 'createdAt' | 'updatedAt' | 'area'> {}