import { T } from "../constants/categories";

export interface addServiceDTO {
  title: string;
  slug: string;
  description: string;
  price_type: "hr" | "one-time";
  price: number;
  category: T;
  location: {
    longitude: number;
    latitude: number;
    name: string;
  };
}
export interface updateServiceDTO {
  title?: string;
  slug?: string;
  description?: string;
  price_type?: "hr" | "one-time";
  price?: number;
  category?: T;
  location: {
    longitude: number;
    latitude: number;
    name: string;
  };
}
