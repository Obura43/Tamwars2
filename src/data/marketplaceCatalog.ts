export type MarketplaceAssetType = 'housing' | 'car';

export interface HousingUnit {
  id: string;
  type: 'Single Room' | 'One Bedroom' | 'Two Bedroom';
  city: 'Kisumu' | 'Nairobi' | 'Mombasa' | 'Nakuru';
  location: string;
  project: string;
  priceTws: number;
  bedrooms: number;
}

export interface CarItem {
  id: string;
  name: string;
  className: string;
  color: string;
  priceTws: number;
  speed: number;
  handling: number;
}

export const HOUSING_UNITS: HousingUnit[] = [
  {
    id: 'nairobi-pangani-single',
    type: 'Single Room',
    city: 'Nairobi',
    location: 'Pangani',
    project: 'Pangani Estate',
    priceTws: 850000,
    bedrooms: 0,
  },
  {
    id: 'nairobi-park-road-one-bed',
    type: 'One Bedroom',
    city: 'Nairobi',
    location: 'Park Road, Ngara',
    project: 'Park Road Affordable Housing',
    priceTws: 1650000,
    bedrooms: 1,
  },
  {
    id: 'nairobi-shauri-moyo-two-bed',
    type: 'Two Bedroom',
    city: 'Nairobi',
    location: 'Shauri Moyo',
    project: 'Shauri Moyo Estate',
    priceTws: 3200000,
    bedrooms: 2,
  },
  {
    id: 'nairobi-starehe-one-bed',
    type: 'One Bedroom',
    city: 'Nairobi',
    location: 'Starehe',
    project: 'Starehe Estate',
    priceTws: 1900000,
    bedrooms: 1,
  },
  {
    id: 'kisumu-single',
    type: 'Single Room',
    city: 'Kisumu',
    location: 'Mamboleo',
    project: 'Kisumu Lakeview Units',
    priceTws: 650000,
    bedrooms: 0,
  },
  {
    id: 'kisumu-two-bed',
    type: 'Two Bedroom',
    city: 'Kisumu',
    location: 'Kibos',
    project: 'Kibos Family Estate',
    priceTws: 2500000,
    bedrooms: 2,
  },
  {
    id: 'mombasa-one-bed',
    type: 'One Bedroom',
    city: 'Mombasa',
    location: 'Changamwe',
    project: 'Changamwe Urban Homes',
    priceTws: 1450000,
    bedrooms: 1,
  },
  {
    id: 'mombasa-two-bed',
    type: 'Two Bedroom',
    city: 'Mombasa',
    location: 'Bamburi',
    project: 'Bamburi Coast Units',
    priceTws: 2850000,
    bedrooms: 2,
  },
  {
    id: 'nakuru-single',
    type: 'Single Room',
    city: 'Nakuru',
    location: 'Lanet',
    project: 'Lanet Starter Homes',
    priceTws: 600000,
    bedrooms: 0,
  },
  {
    id: 'nakuru-one-bed',
    type: 'One Bedroom',
    city: 'Nakuru',
    location: 'Pipeline',
    project: 'Pipeline Estate',
    priceTws: 1300000,
    bedrooms: 1,
  },
];

export const CAR_ITEMS: CarItem[] = [
  {
    id: 'toy-coupe-gt',
    name: 'Toy Coupe GT',
    className: 'Luxury Coupe',
    color: 'Pearl White',
    priceTws: 400000,
    speed: 82,
    handling: 74,
  },
  {
    id: 'toy-safari-v8',
    name: 'Toy Safari V8',
    className: 'Luxury SUV',
    color: 'Midnight Black',
    priceTws: 750000,
    speed: 72,
    handling: 68,
  },
  {
    id: 'toy-royal-sedan',
    name: 'Toy Royal Sedan',
    className: 'Executive Sedan',
    color: 'Champagne Gold',
    priceTws: 950000,
    speed: 78,
    handling: 80,
  },
  {
    id: 'toy-hyper-sport',
    name: 'Toy Hyper Sport',
    className: 'Supercar',
    color: 'Volcano Red',
    priceTws: 1800000,
    speed: 96,
    handling: 88,
  },
];
