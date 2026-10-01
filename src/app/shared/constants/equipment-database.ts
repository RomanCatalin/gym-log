export interface EquipmentBrand 
{
  name: string;
  logo?: string;
}

export const EQUIPMENT_BRANDS: EquipmentBrand[] = 
[
  {
    name: 'Hammer Strength',
    logo: 'assets/brands/hammerstrength-logo.png',
  },
  {
    name: 'Life Fitness',
    logo: 'assets/brands/lifefitness-logo.png',
  },
  {
    name: 'Technogym',
    logo: 'assets/brands/technogym-logo.png',
  },
  {
    name: 'Cybex',
    logo: 'assets/brands/cybex-logo.png',
  },
  {
    name: 'Matrix',
    logo: 'assets/brands/matrix-logo.png',
  },
  {
    name: 'Panatta',
    logo: 'assets/brands/panatta-logo.png',
  },
  {
    name: 'Hoist',
    logo: 'assets/brands/hoist-logo.png',
  },
  {
    name: 'Precor',
    logo: 'assets/brands/precor-logo.png',
  },


];

export interface EquipmentAttachment 
{
  name: string;
}

export const CABLE_ATTACHMENTS: EquipmentAttachment[] = 
[
  { name: 'Straight Bar' },
  { name: 'Rope' },
  { name: 'V-Bar' },
  { name: 'D-Handle' },
  { name: 'Solid D-Handle' },
  { name: 'Lat Pulldown Bar' },
  { name: 'Wide Grip Lat Bar' },
  { name: 'Close Grip Lat Bar' },
  { name: 'Wrist Cuff' },
  { name: 'Ankle Strap' },
];
