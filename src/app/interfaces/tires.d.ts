export interface TiresData {
  TireId: string;
  VaultId?: number;
  Code: string;
  Size?: string;
  VaultName?: string;
  Model?: null;
  Location?: string;
  Nail?: null;
  Description?: string;
  Priority?: number;
  DOT?: string;
  Brand?: string;
  Height?: string;
  Width?: string;
  Material?: null;
  Patched?: string;
  Tread?: string;
  CreationDate?: Date;
  Status?: string;
  ModificationUserId?: string;
  ModificationDate?: Date;
  CreationUserId?: string;
  StatusId?: number;
  TreadId?: number;
  MaterialId?: null;
  HeightId?: number;
  WidthId?: number;
  SizeId?: number;
  BrandId?: number;
  Condition?: string;
  ConditionId?: number;
  Local?: string;
  ProductType?: string;
  ProductTypeId?: number;
  Amount?: number;
  RealSize?: string;
  Price?: number;
  RemainingLife?: null;
  Image1?: null;
  Image2?: null;
  Image3?: null;
  Image4?: null;
  Trash?: boolean;
  ModelId?: number;
  KindSale?: string;
  KindSaleId?: number;
  Model2?: string;
  Single?: boolean;
  SetOf2?: boolean;
  SetOf4?: boolean;
  loadIndex?: string;
  speedIndex?: string;
  LoadIndexId?: number;
  SpeedIndexId?: number;
  LocalId?: number;
  LocalCode?: string;
  OfferUp?: null;
  OfferUpId?: number;
}

export interface singleTireImages {
  id: number;
  name: string;
  src: string;
  alt: string;
}

export interface SingleTireDetails {
  name: string;
  items: string[];
}

export interface SingleTire {
  id: number;
  name: string;
  color: string;
  price: string;
  brand: string;
  brandId: number;
  condition: string;
  patched: string;
  remainingLife: string;
  treadDepth: string;
  images: singleProductImages[];
  description: string;
  details: SingleProductDetails;
}

interface TireInformationProps {
  singleTire: SingleTire;
}
