export interface Listing {
  id: number;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  guests: number;
  type: "apartment" | "house" | "villa" | "cabin";
  amenities: string[];
  rating?: number;
  host: string;
}

export const listings: Listing[] = [
  {
    id: 1,
    title: "Cozy Beachfront Apartment",
    description: "A beautiful apartment right on the beach.",
    location: "Miami, FL",
    pricePerNight: 150,
    guests: 2,
    type: "apartment",
    amenities: ["WiFi", "Kitchen", "Air conditioning", "Pool"],
    rating: 4.8,
    host: "John Doe"
  },
  {
    id: 2,
    title: "Modern House in the City",
    description: "Spacious house close to all major attractions.",
    location: "New York, NY",
    pricePerNight: 250,
    guests: 6,
    type: "house",
    amenities: ["WiFi", "Kitchen", "Heating", "Washer"],
    rating: 4.5,
    host: "Jane Smith"
  },
  {
    id: 3,
    title: "Luxury Villa with Private Pool",
    description: "Experience ultimate luxury in this stunning villa.",
    location: "Los Angeles, CA",
    pricePerNight: 500,
    guests: 8,
    type: "villa",
    amenities: ["WiFi", "Kitchen", "Pool", "Gym", "Parking"],
    rating: 5.0,
    host: "Alice Johnson"
  }
];
