import {
  Search,
  Bell,
  Brush,
  Shirt,
  Wrench,
  Droplet,
  Zap,
  Gift,
  Home,
  X,
  Fan,
  Refrigerator,
  Wind,
  Trash2,
  Car,
  Package,
  Sofa,
  Trees,
  Hammer,
  PaintBucket,
  Lightbulb,
  Clock,
  Wifi,
  TowerControl,
  Video,
  Mic,
  Camera,
} from 'lucide-react-native';

export const featuredServices = [
  {
    id: '1',
    name: 'AC Services',
    image: 'ac_image',
    backgroundColor: '#A8D5A8',
    category: 'Ac',
  },
  {
    id: '2',
    name: 'Plumbing Services',
    image: 'plumbing_image',
    backgroundColor: '#5C9999',
    category: 'Plumbing Services',
  },
  {
    id: '3',
    name: 'Electrical Services',
    image: 'electrical_image',
    backgroundColor: '#FFB84D',
    category: 'Electrical Services',
  },
  {
    id: '4',
    name: 'Home Appliances Repair',
    image: 'appliances_image',
    backgroundColor: '#2C2C2C',
    category: 'Home Appliances Repair',
  },
  {
    id: '5',
    name: 'Salon for Men',
    image: 'man_salon_image',
    backgroundColor: '#E8A5C3',
    category: 'Man Salon',
  },
  {
    id: '6',
    name: 'Salon for Women',
    image: 'woman_salon_image',
    backgroundColor: '#87CEEB',
    category: 'Woman Salon',
  },
  {
    id: '7',
    name: 'Bike Services',
    image: 'bike_image',
    backgroundColor: '#C3E2FF',
    category: 'Bike Services',
  },
  {
    id: '8',
    name: 'Car Services',
    image: 'car_image',
    backgroundColor: '#FFD6A5',
    category: 'Car Services',
  },
  {
    id: '9',
    name: 'Carpenter Services',
    image: 'carpenter_image',
    backgroundColor: '#F2B8A2',
    category: 'Carpenter Services',
  },
  {
    id: '10',
    name: 'Cleaning Services',
    image: 'cleaning_image',
    backgroundColor: '#BDE0FE',
    category: 'Cleaning Services',
  },
  {
    id: '11',
    name: 'Painting & Renovation',
    image: 'painting_image',
    backgroundColor: '#FFCBCB',
    category: 'Painting & Renovation',
  },
  {
    id: '12',
    name: 'Event & Professional Services',
    image: 'event_image',
    backgroundColor: '#B8FFD8',
    category: 'Event & Professional Services',
  },
  {
    id: '13',
    name: 'CCTV Setup',
    image: 'cctv_image',
    backgroundColor: '#C7CEEA',
    category: 'Cctv Setup',
  },
  {
    id: '14',
    name: 'WiFi Setup',
    image: 'wifi_image',
    backgroundColor: '#FFEBB7',
    category: 'Wifi Setup',
  },
];

export const popularPackages = [
  {
    id: '1',
    name: 'Home Deep Cleaning Combo',
    image: 'image_cleaning',
    backgroundColor: '#F3F4F6',
    services: 'Full Home Cleaning + Bathroom & Kitchen Cleaning',
    price: '₹1499',
    discount: 'Save 20%',
  },
  {
    id: '2',
    name: 'Summer AC & Cooling Pack',
    image: 'image_ac',
    backgroundColor: '#E0F7FA',
    services: 'AC Service + Cooler Checkup',
    price: '₹899',
    discount: 'Save 18%',
  },
  {
    id: '3',
    name: 'Home Repair Essentials',
    image: 'image_repair',
    backgroundColor: '#FFF3CD',
    services: 'Plumbing Fix + Electrical Inspection',
    price: '₹799',
    discount: 'Save 25%',
  },
  {
    id: '4',
    name: 'Wedding / Event Special Pack',
    image: 'image_event',
    backgroundColor: '#F3E8FF',
    services: 'Decoration + Photographer + Catering',
    price: '₹9999',
    discount: 'Save 30%',
  },
];

export const serviceCategories = {
  /* ============================
        AC SERVICES
  ============================ */
  Ac: [
    {
      id: 'ac1',
      name: 'AC Repair',
      icon: Fan,
      color: '#0EA5E9',
      category: 'Ac',
      price: '₹300–600',
      rating: '4.8',
      description:
        'Comprehensive AC repair including cooling issues, gas problems, and noise repairs.',
    },
    {
      id: 'ac2',
      name: 'AC Installation',
      icon: Wrench,
      color: '#0EA5E9',
      category: 'Ac',
      price: '₹700–1500',
      rating: '4.9',
      description: 'Installation of split and window AC with proper mounting and gas check.',
    },
    {
      id: 'ac3',
      name: 'AC Service',
      icon: Brush,
      color: '#0EA5E9',
      category: 'Ac',
      price: '₹350–500',
      rating: '4.7',
      description: 'Complete AC servicing including filter cleaning and cooling efficiency check.',
    },
  ],

  /* ============================
        PLUMBING SERVICES
  ============================ */
  'Plumbing Services': [
    {
      id: 'pl1',
      name: 'Tap / Faucet Repair',
      icon: Droplet,
      color: '#0EA5E9',
      price: '₹150–300',
      rating: '4.7',
      category: 'Plumbing Services',
      description: 'Fix leaking or damaged taps, faucets and water flow issues.',
    },
    {
      id: 'pl2',
      name: 'Pipe Leakage Fix',
      icon: Wrench,
      color: '#0EA5E9',
      price: '₹250–500',
      rating: '4.8',
      category: 'Plumbing Services',
      description: 'Pipe crack sealing, leakage fixing, and replacements.',
    },
    {
      id: 'pl3',
      name: 'Bathroom Fitting Installation',
      icon: Home,
      color: '#0EA5E9',
      price: '₹500–1200',
      rating: '4.9',
      category: 'Plumbing Services',
      description: 'Installation of showers, taps, jets, and bathroom hardware.',
    },
    {
      id: 'pl4',
      name: 'Water Tank Cleaning',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹400–1000',
      rating: '4.6',
      category: 'Plumbing Services',
      description: 'Hygienic water tank cleaning using safe methods.',
    },
  ],

  /* ============================
        ELECTRICAL SERVICES
  ============================ */
  'Electrical Services': [
    {
      id: 'el1',
      name: 'New Wiring / Rewiring',
      icon: Zap,
      color: '#0EA5E9',
      price: '₹1500–4000',
      rating: '4.9',
      category: 'Electrical Services',
      description: 'Full wiring and rewiring for homes and commercial spaces.',
    },
    {
      id: 'el2',
      name: 'Switch / Socket Repair',
      icon: Lightbulb,
      color: '#0EA5E9',
      price: '₹100–300',
      rating: '4.7',
      category: 'Electrical Services',
      description: 'Fix and install sockets, switches, and electric points.',
    },
    {
      id: 'el3',
      name: 'Ceiling Fan Installation & Repair',
      icon: Fan,
      color: '#0EA5E9',
      price: '₹150–400',
      rating: '4.8',
      category: 'Electrical Services',
      description: 'Fan installation, noise fixing, and repair services.',
    },
    {
      id: 'el4',
      name: 'Lighting Setup',
      icon: Lightbulb,
      color: '#0EA5E9',
      price: '₹200–600',
      rating: '4.8',
      category: 'Electrical Services',
      description: 'LED, chandelier, and decorative lighting installation.',
    },
  ],

  /* ============================
        HOME APPLIANCES
  ============================ */
  'Home Appliances Repair': [
    {
      id: 'ha1',
      name: 'Cooler Repair',
      icon: Fan,
      color: '#0EA5E9',
      price: '₹200–500',
      rating: '4.7',
      category: 'Home Appliances Repair',
      description: 'Motor, pump and cooling pad servicing.',
    },
    {
      id: 'ha2',
      name: 'Refrigerator Repair',
      icon: Refrigerator,
      color: '#0EA5E9',
      price: '₹300–800',
      rating: '4.8',
      category: 'Home Appliances Repair',
      description: 'Cooling issues, compressor repair, and gas refill.',
    },
    {
      id: 'ha3',
      name: 'Washing Machine Repair',
      icon: Package,
      color: '#0EA5E9',
      price: '₹250–700',
      rating: '4.7',
      category: 'Home Appliances Repair',
      description: 'Spin, drain, motor, and drum issues repair.',
    },
    {
      id: 'ha4',
      name: 'Geyser Repair',
      icon: Zap,
      color: '#0EA5E9',
      price: '₹300–650',
      rating: '4.6',
      category: 'Home Appliances Repair',
      description: 'Heating issues, thermostat replacement.',
    },
    {
      id: 'ha5',
      name: 'Microwave Repair',
      icon: Package,
      color: '#0EA5E9',
      price: '₹250–500',
      rating: '4.6',
      category: 'Home Appliances Repair',
      description: 'Heating element, PCB and timer repair.',
    },
    {
      id: 'ha6',
      name: 'Chimney Installation & Repair',
      icon: Home,
      color: '#0EA5E9',
      price: '₹500–1500',
      rating: '4.8',
      category: 'Home Appliances Repair',
      description: 'Chimney fitting, servicing and duct installation.',
    },
    {
      id: 'ha7',
      name: 'Water Purifier (RO) Service',
      icon: Droplet,
      color: '#0EA5E9',
      price: '₹300–800',
      rating: '4.8',
      category: 'Home Appliances Repair',
      description: 'RO filter change, servicing and leak fixing.',
    },
  ],

  /* ============================
       SALON SERVICES (MEN)
  ============================ */
  'Man Salon': [
    {
      id: 'ms1',
      name: 'Men’s Haircut & Beard Grooming',
      icon: Wrench,
      color: '#0EA5E9',
      price: '₹150–300',
      rating: '4.9',
      category: 'Man Salon',
      description: 'Professional haircut & beard styling at home.',
    },
    {
      id: 'ms2',
      name: 'Grooming & Facial',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹300–700',
      rating: '4.8',
      category: 'Man Salon',
      description: 'Deep face cleansing and grooming services.',
    },
  ],

  /* ============================
       SALON SERVICES (WOMEN)
  ============================ */
  'Woman Salon': [
    {
      id: 'ws1',
      name: 'Women’s Haircut & Beauty Services',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹250–800',
      rating: '4.9',
      category: 'Woman Salon',
      description: 'Haircut, styling and beauty packages at home.',
    },
    {
      id: 'ws2',
      name: 'Facial / Threading / Waxing',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹150–600',
      rating: '4.8',
      category: 'Woman Salon',
      description: 'Complete grooming including waxing and facial.',
    },
    {
      id: 'ws3',
      name: 'Bridal Makeup at Home',
      icon: Home,
      color: '#0EA5E9',
      price: '₹1500–4000',
      rating: '5.0',
      category: 'Woman Salon',
      description: 'Professional bridal makeup service at your home.',
    },
  ],

  /* ============================
        BIKE SERVICES
  ============================ */
  'Bike Services': [
    {
      id: 'bs1',
      name: 'Road Side Assistance',
      icon: TowerControl,
      color: '#0EA5E9',
      price: '₹200–500',
      rating: '4.8',
      category: 'Bike Services',
      description: 'Immediate bike breakdown recovery.',
    },
    {
      id: 'bs2',
      name: 'Bike Repair',
      icon: Wrench,
      color: '#0EA5E9',
      price: '₹200–800',
      rating: '4.7',
      category: 'Bike Services',
      description: 'General service, engine repair and more.',
    },
  ],

  /* ============================
        CAR SERVICES
  ============================ */
  'Car Services': [
    {
      id: 'cs1',
      name: 'Car Repair',
      icon: Wrench,
      color: '#0EA5E9',
      price: '₹500–2000',
      rating: '4.8',
      category: 'Car Services',
      description: 'Engine, suspension and electrical repairs.',
    },
    {
      id: 'cs2',
      name: 'Road Side Assistance',
      icon: TowerControl,
      color: '#0EA5E9',
      price: '₹300–800',
      rating: '4.7',
      category: 'Car Services',
      description: 'Emergency car support and towing.',
    },
    {
      id: 'cs3',
      name: 'Battery Jumpstart',
      icon: Zap,
      color: '#0EA5E9',
      price: '₹150–400',
      rating: '4.6',
      category: 'Car Services',
      description: 'Instant battery jumpstart help.',
    },
  ],

  /* ============================
        CARPENTER SERVICES
  ============================ */
  'Carpenter Services': [
    {
      id: 'cp1',
      name: 'Furniture Repair',
      icon: Hammer,
      color: '#0EA5E9',
      price: '₹300–800',
      rating: '4.7',
      category: 'Carpenter Services',
      description: 'Repair sofas, chairs, beds and wardrobes.',
    },
    {
      id: 'cp2',
      name: 'New Furniture Making',
      icon: Hammer,
      color: '#0EA5E9',
      price: '₹1500–5000',
      rating: '4.9',
      category: 'Carpenter Services',
      description: 'Custom furniture build including kitchen and cabinets.',
    },
    {
      id: 'cp3',
      name: 'Door / Window Repair',
      icon: Package,
      color: '#0EA5E9',
      price: '₹300–600',
      rating: '4.6',
      category: 'Carpenter Services',
      description: 'Fix locks, hinges, and wooden frame issues.',
    },
    {
      id: 'cp4',
      name: 'Modular Kitchen Work',
      icon: Home,
      color: '#0EA5E9',
      price: '₹5000–15000',
      rating: '4.8',
      category: 'Carpenter Services',
      description: 'Full modular kitchen installation and fittings.',
    },
  ],

  /* ============================
        CLEANING SERVICES
  ============================ */
  'Cleaning Services': [
    {
      id: 'cl1',
      name: 'Home Deep Cleaning',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹1500–3000',
      rating: '4.9',
      category: 'Cleaning Services',
      description: 'Full home deep cleaning including bathrooms & kitchen.',
    },
    {
      id: 'cl2',
      name: 'Sofa & Carpet Cleaning',
      icon: Sofa,
      color: '#0EA5E9',
      price: '₹300–900',
      rating: '4.8',
      category: 'Cleaning Services',
      description: 'Professional steam cleaning of sofa & carpets.',
    },
    {
      id: 'cl3',
      name: 'Bathroom / Kitchen Cleaning',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹400–900',
      rating: '4.7',
      category: 'Cleaning Services',
      description: 'Deep cleaning of bathrooms & kitchen surfaces.',
    },
    {
      id: 'cl4',
      name: 'Water Tank Cleaning',
      icon: Droplet,
      color: '#0EA5E9',
      price: '₹400–1000',
      rating: '4.7',
      category: 'Cleaning Services',
      description: 'Safe water tank cleaning and disinfection.',
    },
  ],

  /* ============================
        PAINTING & RENOVATION
  ============================ */
  'Painting & Renovation': [
    {
      id: 'pr1',
      name: 'Wall Painting',
      icon: Brush,
      color: '#0EA5E9',
      price: '₹1000–3000',
      rating: '4.8',
      category: 'Painting & Renovation',
      description: 'Premium interior and exterior wall painting.',
    },
    {
      id: 'pr2',
      name: 'Waterproofing',
      icon: Droplet,
      color: '#0EA5E9',
      price: '₹2000–5000',
      rating: '4.7',
      category: 'Painting & Renovation',
      description: 'Terrace, wall and bathroom waterproofing.',
    },
    {
      id: 'pr3',
      name: 'POP / False Ceiling Work',
      icon: Home,
      color: '#0EA5E9',
      price: '₹5000–15000',
      rating: '4.9',
      category: 'Painting & Renovation',
      description: 'False ceiling installation, POP & gypsum work.',
    },
    {
      id: 'pr4',
      name: 'Floor / Tile Work',
      icon: Package,
      color: '#0EA5E9',
      price: '₹3000–8000',
      rating: '4.8',
      category: 'Painting & Renovation',
      description: 'Tile installation and flooring renovation.',
    },
  ],

  /* ============================
        EVENT & PROFESSIONAL
  ============================ */
  'Event & Professional Services': [
    {
      id: 'ev1',
      name: 'Photographer / Videographer',
      icon: Camera,
      color: '#0EA5E9',
      price: '₹2000–8000',
      rating: '4.9',
      category: 'Event & Professional Services',
      description: 'Event shooting, photography & videography.',
    },
    {
      id: 'ev2',
      name: 'Sound & Lighting Setup',
      icon: Mic,
      color: '#0EA5E9',
      price: '₹3000–10000',
      rating: '4.8',
      category: 'Event & Professional Services',
      description: 'DJ sound, event lighting & stage setup.',
    },
    {
      id: 'ev3',
      name: 'Event Decoration',
      icon: Gift,
      color: '#0EA5E9',
      price: '₹1500–7000',
      rating: '4.8',
      category: 'Event & Professional Services',
      description: 'Birthday, engagement & wedding decor.',
    },
    {
      id: 'ev4',
      name: 'Event Catering',
      icon: Video,
      color: '#0EA5E9',
      price: '₹2000–15000',
      rating: '4.9',
      category: 'Event & Professional Services',
      description: 'Full catering for events and functions.',
    },
  ],

  /* ============================
        CCTV SETUP
  ============================ */
  'Cctv Setup': [
    {
      id: 'ct1',
      name: 'CCTV Installation',
      icon: TowerControl,
      color: '#0EA5E9',
      price: '₹1000–3000',
      rating: '4.8',
      category: 'Cctv Setup',
      description: 'Home/office CCTV installation with DVR setup.',
    },
    {
      id: 'ct2',
      name: 'CCTV Maintenance',
      icon: Wrench,
      color: '#0EA5E9',
      price: '₹500–1000',
      rating: '4.7',
      category: 'Cctv Setup',
      description: 'Camera servicing, wiring & recording issues fix.',
    },
  ],

  /* ============================
        WIFI
  ============================ */
  'Wifi Setup': [
    {
      id: 'wf1',
      name: 'Wifi Setup',
      icon: Wifi,
      color: '#0EA5E9',
      price: '₹300–800',
      rating: '4.8',
      category: 'Wifi Setup',
      description: 'Router installation, wiring and configuration.',
    },
  ],
};

// utils/workersData.ts

export const workersData = {
  /* ============================
        AC SERVICES
  ============================ */
  Ac: [
    {
      id: 'ac-worker-1',
      name: 'Rajesh Kumar',
      rating: 4.8,
      reviewCount: 156,
      phone: '+91 98765 43210',
      experience: '8 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['AC Repair', 'AC Installation', 'Gas Refilling'],
    },
    {
      id: 'ac-worker-2',
      name: 'Amit Patel',
      rating: 4.7,
      reviewCount: 142,
      phone: '+91 98765 43211',
      experience: '6 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['AC Service', 'Cooling Issues', 'Filter Cleaning'],
    },
    {
      id: 'ac-worker-3',
      name: 'Suresh Mehta',
      rating: 4.9,
      reviewCount: 203,
      phone: '+91 98765 43212',
      experience: '12 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['All AC Services', 'Emergency Repair', 'Installation'],
    },
  ],

  /* ============================
        PLUMBING SERVICES
  ============================ */
  'Plumbing Services': [
    {
      id: 'plumber-1',
      name: 'Vikram Singh',
      rating: 4.8,
      reviewCount: 156,
      phone: '+91 98765 43220',
      experience: '8 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Pipe Repair', 'Water Heater', 'Bathroom Fitting'],
    },
    {
      id: 'plumber-2',
      name: 'Ramesh Sharma',
      rating: 4.6,
      reviewCount: 89,
      phone: '+91 98765 43221',
      experience: '5 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Leak Repair', 'Tap Fixing', 'Kitchen Plumbing'],
    },
    {
      id: 'plumber-3',
      name: 'Anil Gupta',
      rating: 4.9,
      reviewCount: 203,
      phone: '+91 98765 43222',
      experience: '12 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['All Plumbing', 'Tank Cleaning', 'Emergency Service'],
    },
  ],

  /* ============================
        ELECTRICAL SERVICES
  ============================ */
  'Electrical Services': [
    {
      id: 'electrician-1',
      name: 'Manoj Yadav',
      rating: 4.7,
      reviewCount: 134,
      phone: '+91 98765 43230',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Wiring', 'Panel Upgrade', 'Lighting Setup'],
    },
    {
      id: 'electrician-2',
      name: 'Prakash Joshi',
      rating: 4.8,
      reviewCount: 167,
      phone: '+91 98765 43231',
      experience: '9 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Short Circuit', 'Fan Installation', 'Switch Board'],
    },
    {
      id: 'electrician-3',
      name: 'Deepak Verma',
      rating: 4.9,
      reviewCount: 187,
      phone: '+91 98765 43232',
      experience: '10 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['All Electrical', 'Rewiring', 'Safety Audit'],
    },
  ],

  /* ============================
        HOME APPLIANCES REPAIR
  ============================ */
  'Home Appliances Repair': [
    {
      id: 'appliance-1',
      name: 'Sanjay Kumar',
      rating: 4.7,
      reviewCount: 167,
      phone: '+91 98765 43240',
      experience: '8 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Refrigerator', 'Washing Machine', 'Microwave'],
    },
    {
      id: 'appliance-2',
      name: 'Kiran Shah',
      rating: 4.8,
      reviewCount: 193,
      phone: '+91 98765 43241',
      experience: '10 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['AC Repair', 'Geyser', 'RO Service'],
    },
    {
      id: 'appliance-3',
      name: 'Ravi Desai',
      rating: 4.9,
      reviewCount: 210,
      phone: '+91 98765 43242',
      experience: '13 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['All Appliances', 'Cooler', 'Chimney Installation'],
    },
  ],

  /* ============================
        MAN SALON
  ============================ */
  'Man Salon': [
    {
      id: 'man-salon-1',
      name: 'Arjun Kapoor',
      rating: 4.9,
      reviewCount: 245,
      phone: '+91 98765 43250',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Haircut', 'Beard Grooming', 'Facial'],
    },
    {
      id: 'man-salon-2',
      name: 'Rahul Mehta',
      rating: 4.8,
      reviewCount: 198,
      phone: '+91 98765 43251',
      experience: '5 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Hair Styling', 'Grooming', 'Spa Services'],
    },
  ],

  /* ============================
        WOMAN SALON
  ============================ */
  'Woman Salon': [
    {
      id: 'woman-salon-1',
      name: 'Priya Sharma',
      rating: 4.9,
      reviewCount: 312,
      phone: '+91 98765 43260',
      experience: '9 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Haircut', 'Bridal Makeup', 'Facial'],
    },
    {
      id: 'woman-salon-2',
      name: 'Neha Patel',
      rating: 4.8,
      reviewCount: 267,
      phone: '+91 98765 43261',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Waxing', 'Threading', 'Beauty Services'],
    },
    {
      id: 'woman-salon-3',
      name: 'Anjali Desai',
      rating: 5.0,
      reviewCount: 156,
      phone: '+91 98765 43262',
      experience: '11 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Bridal Makeup', 'Party Makeup', 'Hair Styling'],
    },
  ],

  /* ============================
        BIKE SERVICES
  ============================ */
  'Bike Services': [
    {
      id: 'bike-1',
      name: 'Vijay Kumar',
      rating: 4.8,
      reviewCount: 178,
      phone: '+91 98765 43270',
      experience: '8 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Bike Repair', 'Engine Service', 'Road Assistance'],
    },
    {
      id: 'bike-2',
      name: 'Sachin Patil',
      rating: 4.7,
      reviewCount: 143,
      phone: '+91 98765 43271',
      experience: '6 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['General Service', 'Breakdown Recovery', 'Maintenance'],
    },
  ],

  /* ============================
        CAR SERVICES
  ============================ */
  'Car Services': [
    {
      id: 'car-1',
      name: 'Ashok Mehta',
      rating: 4.8,
      reviewCount: 234,
      phone: '+91 98765 43280',
      experience: '12 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Car Repair', 'Engine Service', 'Electrical Work'],
    },
    {
      id: 'car-2',
      name: 'Dinesh Shah',
      rating: 4.7,
      reviewCount: 187,
      phone: '+91 98765 43281',
      experience: '9 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Road Assistance', 'Battery Service', 'Towing'],
    },
    {
      id: 'car-3',
      name: 'Sunil Verma',
      rating: 4.6,
      reviewCount: 156,
      phone: '+91 98765 43282',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Suspension Repair', 'Battery Jumpstart', 'AC Service'],
    },
  ],

  /* ============================
        CARPENTER SERVICES
  ============================ */
  'Carpenter Services': [
    {
      id: 'carpenter-1',
      name: 'Mohan Lal',
      rating: 4.9,
      reviewCount: 289,
      phone: '+91 98765 43290',
      experience: '15 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Modular Kitchen', 'Custom Furniture', 'Wardrobe'],
    },
    {
      id: 'carpenter-2',
      name: 'Ravi Kumar',
      rating: 4.7,
      reviewCount: 156,
      phone: '+91 98765 43291',
      experience: '10 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Furniture Repair', 'Door Fitting', 'Window Work'],
    },
    {
      id: 'carpenter-3',
      name: 'Ganesh Rao',
      rating: 4.8,
      reviewCount: 203,
      phone: '+91 98765 43292',
      experience: '12 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['All Carpentry', 'Cabinet Making', 'Renovation'],
    },
  ],

  /* ============================
        CLEANING SERVICES
  ============================ */
  'Cleaning Services': [
    {
      id: 'cleaner-1',
      name: 'Sunita Patil',
      rating: 4.9,
      reviewCount: 278,
      phone: '+91 98765 43300',
      experience: '6 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Deep Cleaning', 'Home Cleaning', 'Sanitization'],
    },
    {
      id: 'cleaner-2',
      name: 'Rekha Desai',
      rating: 4.8,
      reviewCount: 234,
      phone: '+91 98765 43301',
      experience: '5 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Sofa Cleaning', 'Carpet Cleaning', 'Kitchen Cleaning'],
    },
    {
      id: 'cleaner-3',
      name: 'Lakshmi Iyer',
      rating: 4.7,
      reviewCount: 189,
      phone: '+91 98765 43302',
      experience: '4 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Bathroom Cleaning', 'Tank Cleaning', 'Window Cleaning'],
    },
  ],

  /* ============================
        PAINTING & RENOVATION
  ============================ */
  'Painting & Renovation': [
    {
      id: 'painter-1',
      name: 'Mahesh Joshi',
      rating: 4.8,
      reviewCount: 245,
      phone: '+91 98765 43310',
      experience: '11 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Wall Painting', 'Waterproofing', 'Exterior Painting'],
    },
    {
      id: 'painter-2',
      name: 'Ramesh Yadav',
      rating: 4.9,
      reviewCount: 198,
      phone: '+91 98765 43311',
      experience: '13 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['False Ceiling', 'POP Work', 'Interior Design'],
    },
    {
      id: 'painter-3',
      name: 'Prakash Gupta',
      rating: 4.7,
      reviewCount: 167,
      phone: '+91 98765 43312',
      experience: '9 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Tile Work', 'Flooring', 'Texture Painting'],
    },
  ],

  /* ============================
        EVENT & PROFESSIONAL SERVICES
  ============================ */
  'Event & Professional Services': [
    {
      id: 'event-1',
      name: 'Rohit Sharma',
      rating: 4.9,
      reviewCount: 312,
      phone: '+91 98765 43320',
      experience: '10 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Photography', 'Videography', 'Event Coverage'],
    },
    {
      id: 'event-2',
      name: 'Ajay Patel',
      rating: 4.8,
      reviewCount: 267,
      phone: '+91 98765 43321',
      experience: '8 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['DJ Service', 'Sound Setup', 'Lighting'],
    },
    {
      id: 'event-3',
      name: 'Kavita Desai',
      rating: 4.8,
      reviewCount: 234,
      phone: '+91 98765 43322',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Event Decoration', 'Wedding Decor', 'Birthday Setup'],
    },
    {
      id: 'event-4',
      name: 'Vinay Kumar',
      rating: 4.9,
      reviewCount: 289,
      phone: '+91 98765 43323',
      experience: '12 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Catering', 'Event Food', 'Party Services'],
    },
  ],

  /* ============================
        CCTV SETUP
  ============================ */
  'Cctv Setup': [
    {
      id: 'cctv-1',
      name: 'Arun Shah',
      rating: 4.8,
      reviewCount: 178,
      phone: '+91 98765 43330',
      experience: '7 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['CCTV Installation', 'DVR Setup', 'Camera Wiring'],
    },
    {
      id: 'cctv-2',
      name: 'Nitin Mehta',
      rating: 4.7,
      reviewCount: 145,
      phone: '+91 98765 43331',
      experience: '6 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['CCTV Maintenance', 'Camera Repair', 'System Upgrade'],
    },
  ],

  /* ============================
        WIFI SETUP
  ============================ */
  'Wifi Setup': [
    {
      id: 'wifi-1',
      name: 'Karan Patel',
      rating: 4.8,
      reviewCount: 198,
      phone: '+91 98765 43340',
      experience: '5 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Router Setup', 'Network Configuration', 'Wifi Installation'],
    },
    {
      id: 'wifi-2',
      name: 'Vishal Kumar',
      rating: 4.7,
      reviewCount: 156,
      phone: '+91 98765 43341',
      experience: '4 years experience',
      profileImage: require('../assets/carpenter.jpg'),
      specialization: ['Wifi Troubleshooting', 'Range Extension', 'Wiring'],
    },
  ],
};

// Helper function to get workers by category
export const getWorkersByCategory = (category: string) => {
  return workersData[category as keyof typeof workersData] || [];
};
