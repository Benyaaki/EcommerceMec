/* ==========================================================================
   AutoRepuestos Pro Chile - Base de Datos Automotriz Relacional (Mock)
   ========================================================================== */

export const VEHICLES_DATABASE = [
  // TOYOTA
  { id: 'v-toyota-yaris-2018-15', brand: 'Toyota', model: 'Yaris', year: 2018, engine: '1.5L 1NZ-FE Gasolina', vinCode: 'TOYOTA-YARIS-2018' },
  { id: 'v-toyota-yaris-2015-15', brand: 'Toyota', model: 'Yaris', year: 2015, engine: '1.5L 1NZ-FE Gasolina' },
  { id: 'v-toyota-corolla-2020-18', brand: 'Toyota', model: 'Corolla', year: 2020, engine: '1.8L Hybrid / 2.0L' },
  { id: 'v-toyota-hilux-2019-28', brand: 'Toyota', model: 'Hilux', year: 2019, engine: '2.8L Turbo Diesel 1GD-FTV' },

  // HYUNDAI
  { id: 'v-hyundai-accent-2019-14', brand: 'Hyundai', model: 'Accent', year: 2019, engine: '1.4L / 1.6L Kappa/Gamma', vinCode: 'HYUNDAI-ACCENT-2019' },
  { id: 'v-hyundai-tucson-2021-20', brand: 'Hyundai', model: 'Tucson', year: 2021, engine: '2.0L Nu MPI' },

  // CHEVROLET
  { id: 'v-chevrolet-sail-2017-15', brand: 'Chevrolet', model: 'Sail', year: 2017, engine: '1.5L STEC III', vinCode: 'CHEVROLET-SAIL-2017' },
  { id: 'v-chevrolet-dmax-2020-30', brand: 'Chevrolet', model: 'D-Max', year: 2020, engine: '3.0L Turbo Diesel' },

  // NISSAN
  { id: 'v-nissan-np300-2018-25', brand: 'Nissan', model: 'NP300 Navara', year: 2018, engine: '2.5L Turbo Diesel YD25' },
  { id: 'v-nissan-kicks-2022-16', brand: 'Nissan', model: 'Kicks', year: 2022, engine: '1.6L HR16DE' },

  // SUZUKI
  { id: 'v-suzuki-swift-2020-12', brand: 'Suzuki', model: 'Swift', year: 2020, engine: '1.2L K12M' }
];

export const PRODUCTS_DATABASE = [
  {
    id: 'prod-001',
    name: 'Pastillas de Freno Delanteras Ceramicas Brembo P85020',
    category: 'frenos',
    brand: 'Brembo',
    sku: 'BRE-P85020',
    oemCode: '04465-0D050 / 04465-52240',
    price: 34990,
    compareAtPrice: 42990,
    stock: 14,
    rating: 4.9,
    reviewsCount: 28,
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=600&auto=format&fit=crop&q=80',
    description: 'Pastillas de freno de alto rendimiento formuladas con compuesto cerámico ecológico Brembo. Reducen el polvo en las llantas, eliminan ruidos y ofrecen excelente mordida térmica.',
    specifications: [
      { key: 'Posición', value: 'Eje Delantero' },
      { key: 'Espesor', value: '17.5 mm' },
      { key: 'Material', value: 'Cerámica Avanzada (Low-Dust)' },
      { key: 'Origen', value: 'Italia' },
      { key: 'Garantía', value: '6 Meses SERNAC' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-yaris-2015-15', 'v-toyota-corolla-2020-18', 'v-suzuki-swift-2020-12']
  },
  {
    id: 'prod-002',
    name: 'Juego de Discos de Freno Ventilados Bosch QuietCast',
    category: 'frenos',
    brand: 'Bosch',
    sku: 'BOS-0986479123',
    oemCode: '43512-52120 / 43512-0D030',
    price: 52990,
    stock: 8,
    rating: 4.8,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format&fit=crop&q=80',
    description: 'Discos de freno ventilados Bosch maquinados con precisión al carbono. Balance dinámico de fábrica para frenadas suaves sin vibraciones en el pedal.',
    specifications: [
      { key: 'Diámetro Exterior', value: '255 mm' },
      { key: 'Tipo', value: 'Ventilado' },
      { key: 'Perforaciones', value: '4 Pernos' },
      { key: 'Origen', value: 'Alemania' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-yaris-2015-15', 'v-chevrolet-sail-2017-15']
  },
  {
    id: 'prod-003',
    name: 'Kit Amortiguadores Delanteros Gas KYB Excel-G',
    category: 'suspension',
    brand: 'KYB',
    sku: 'KYB-333418-SET',
    oemCode: '48510-0D330 / 48520-0D330',
    price: 119900,
    compareAtPrice: 149900,
    stock: 6,
    rating: 5.0,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    description: 'Par de amortiguadores a nitrógeno presurizado KYB Excel-G. Restauran el control original del vehículo, mejorando la estabilidad en curvas y frenado de emergencia.',
    specifications: [
      { key: 'Construcción', value: 'Bitubo a Gas Nitro' },
      { key: 'Lado', value: 'Izquierdo y Derecho (Par)' },
      { key: 'Garantía', value: '1 Año Defectos Fábrica' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-yaris-2015-15', 'v-hyundai-accent-2019-14']
  },
  {
    id: 'prod-004',
    name: 'Filtro de Aceite sintético Mann-Filter W 68/3',
    category: 'filtros',
    brand: 'Mann-Filter',
    sku: 'MAN-W683',
    oemCode: '90915-YZZE1 / 90915-YZZJ1',
    price: 8990,
    stock: 45,
    rating: 4.9,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    description: 'Filtro de aceite blindado Mann-Filter de máxima retención microbiana. Protege los componentes internos del motor reteniendo partículas abrasivas de hasta 10 micras.',
    specifications: [
      { key: 'Rosca', value: '3/4-16 UNF' },
      { key: 'Válvula Bypass', value: '1.0 bar' },
      { key: 'Origen', value: 'Alemania' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-yaris-2015-15', 'v-toyota-corolla-2020-18', 'v-suzuki-swift-2020-12']
  },
  {
    id: 'prod-005',
    name: 'Aceite de Motor 100% Sintético Mobil 1 ESP 5W-30 (4 Litros)',
    category: 'filtros',
    brand: 'Mobil 1',
    sku: 'MOB-5W30-4L',
    oemCode: 'API SP / ACEA C2 C3',
    price: 42990,
    stock: 22,
    rating: 5.0,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&auto=format&fit=crop&q=80',
    description: 'Lubricante sintético avanzado formulado para ayudar a proporcionar una limpieza excepcional, protección contra el desgaste y rendimiento general en motores benzineros y diésel DPF.',
    specifications: [
      { key: 'Viscosidad', value: '5W-30' },
      { key: 'Volumen', value: '4 Litros' },
      { key: 'Norma', value: 'API SP / ILSAC GF-6A' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-corolla-2020-18', 'v-hyundai-accent-2019-14', 'v-nissan-kicks-2022-16', 'v-toyota-hilux-2019-28']
  },
  {
    id: 'prod-006',
    name: 'Kit de Distribución con Bomba de Agua Valeo Premium',
    category: 'motor',
    brand: 'Valeo',
    sku: 'VAL-KDB-789',
    oemCode: '13568-19045-SET',
    price: 89900,
    stock: 5,
    rating: 4.7,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&auto=format&fit=crop&q=80',
    description: 'Kit completo de correa dentada sincronizada, poleas tensoras HNBR reforzadas y bomba de agua de turbina metálica para servicio integral de motor.',
    specifications: [
      { key: 'Dientes Correa', value: '117 Dientes' },
      { key: 'Incluye', value: 'Correa + Rodamientos + Bomba Agua' }
    ],
    compatibleVehicles: ['v-chevrolet-sail-2017-15', 'v-hyundai-accent-2019-14']
  },
  {
    id: 'prod-007',
    name: 'Juego de 4 Bujías de Iridio NGK Laser Iridium SILFR6A11',
    category: 'electricidad',
    brand: 'NGK',
    sku: 'NGK-5468-4PK',
    oemCode: '90919-01247 / ILKAR7B11',
    price: 39990,
    compareAtPrice: 47990,
    stock: 30,
    rating: 4.9,
    reviewsCount: 51,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
    description: 'Bujías de encendido de fina punta de Iridio con electrodo de platino. Garantizan encendido instantáneo, optimización del consumo de combustible y durabilidad de 100.000 km.',
    specifications: [
      { key: 'Electrodo', value: 'Iridio 0.6mm' },
      { key: 'Vida Útil', value: '100.000 km' },
      { key: 'Origen', value: 'Japón' }
    ],
    compatibleVehicles: ['v-toyota-yaris-2018-15', 'v-toyota-corolla-2020-18', 'v-suzuki-swift-2020-12', 'v-nissan-kicks-2022-16']
  },
  {
    id: 'prod-008',
    name: 'Batería Automotriz Bosch S4 65AH 580CCA Libre Mantenimiento',
    category: 'electricidad',
    brand: 'Bosch',
    sku: 'BOS-S4-65AH',
    oemCode: '56530 / DIN65',
    price: 84990,
    stock: 10,
    rating: 4.8,
    reviewsCount: 37,
    image: 'https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?w=600&auto=format&fit=crop&q=80',
    description: 'Batería de aleación de plata Bosch S4 con tecnología PowerFrame. Potencia de arranque garantizada en frío para vehículos con alto equipamiento electrónico.',
    specifications: [
      { key: 'Capacidad', value: '65 Ah' },
      { key: 'CCA (-18°C)', value: '580 Amp' },
      { key: 'Polaridad', value: 'Borne Positivo Derecho' }
    ],
    compatibleVehicles: ['v-nissan-np300-2018-25', 'v-toyota-hilux-2019-28', 'v-chevrolet-dmax-2020-30', 'v-hyundai-tucson-2021-20']
  }
];

/* Helper Database Functions */

export function getUniqueBrands() {
  const brands = VEHICLES_DATABASE.map(v => v.brand);
  return [...new Set(brands)].sort();
}

export function getModelsForBrand(brand) {
  const models = VEHICLES_DATABASE
    .filter(v => v.brand.toLowerCase() === brand.toLowerCase())
    .map(v => v.model);
  return [...new Set(models)].sort();
}

export function getYearsForModel(brand, model) {
  const years = VEHICLES_DATABASE
    .filter(v => v.brand.toLowerCase() === brand.toLowerCase() && v.model.toLowerCase() === model.toLowerCase())
    .map(v => v.year);
  return [...new Set(years)].sort((a, b) => b - a);
}

export function getEnginesForVehicle(brand, model, year) {
  const engines = VEHICLES_DATABASE
    .filter(v => 
      v.brand.toLowerCase() === brand.toLowerCase() &&
      v.model.toLowerCase() === model.toLowerCase() &&
      (!year || v.year === parseInt(year))
    )
    .map(v => v.engine);
  return [...new Set(engines)];
}

export function findVehicleObject(brand, model, year) {
  return VEHICLES_DATABASE.find(v => 
    v.brand.toLowerCase() === brand.toLowerCase() &&
    v.model.toLowerCase() === model.toLowerCase() &&
    (!year || v.year === parseInt(year))
  );
}

export function formatCLP(amount) {
  return '$' + new Intl.NumberFormat('es-CL').format(amount) + ' CLP';
}
