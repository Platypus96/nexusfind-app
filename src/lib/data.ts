export type InstitutionID = 'IIITA' | 'IIITH' | 'IIITD' | 'IIITB';

export type Item = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  status: 'lost' | 'found';
  resolved: boolean;
  institution: InstitutionID;
  category: string;
  userId: string;
};

export const institutions: {id: InstitutionID, name: string}[] = [
  { id: 'IIITA', name: 'IIIT Allahabad' },
  { id: 'IIITH', name: 'IIIT Hyderabad' },
  { id: 'IIITD', name: 'IIIT Delhi' },
  { id: 'IIITB', name: 'IIIT Bangalore' },
];

export const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Bottles",
  "Keys",
  "IDs & Cards",
  "Jewelry",
  "Accessories",
  "Other",
];

export const items: Item[] = [
  {
    id: '1',
    name: 'Blue Water Bottle',
    description: 'A classic blue water bottle, might have a small dent on the side. Last seen near the library.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'water bottle',
    status: 'lost',
    resolved: false,
    institution: 'IIITA',
    category: 'Bottles',
    userId: 'initial_user_1'
  },
  {
    id: '2',
    name: 'Found: Black Headphones',
    description: 'Found a pair of black Sony headphones in the cafeteria. They are in their case.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'headphones case',
    status: 'found',
    resolved: false,
    institution: 'IIITA',
    category: 'Electronics',
    userId: 'initial_user_2'
  },
  {
    id: '3',
    name: 'Lost ID Card',
    description: 'Lost my student ID card, name is "Alex Doe". Probably dropped it somewhere in the academic block.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'id card',
    status: 'lost',
    resolved: true,
    institution: 'IIITH',
    category: 'IDs & Cards',
    userId: 'initial_user_1'
  },
  {
    id: '4',
    name: 'Gray Hoodie',
    description: 'Lost a gray hoodie with a university logo on it. It was in the sports complex.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gray hoodie',
    status: 'lost',
    resolved: false,
    institution: 'IIITD',
    category: 'Clothing',
    userId: 'initial_user_3'
  },
  {
    id: '5',
    name: 'Found: Set of Keys',
    description: 'Found a set of keys with a red keychain attached. They were on a bench near the main gate.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'keys keychain',
    status: 'found',
    resolved: false,
    institution: 'IIITB',
    category: 'Keys',
    userId: 'initial_user_4'
  },
  {
    id: '6',
    name: 'Mathematics Textbook',
    description: 'Lost my "Advanced Engineering Mathematics" textbook. It has some notes written inside.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'book math',
    status: 'lost',
    resolved: false,
    institution: 'IIITA',
    category: 'Books',
    userId: 'initial_user_1'
  },
   {
    id: '7',
    name: 'Found: Silver Ring',
    description: 'Found a simple silver ring in the library washroom. It seems to have an engraving inside.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'silver ring',
    status: 'found',
    resolved: false,
    institution: 'IIITH',
    category: 'Jewelry',
    userId: 'initial_user_5'
  },
  {
    id: '8',
    name: 'Lost: Black Umbrella',
    description: 'Left my black umbrella in Lecture Hall 5. It has a wooden handle.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'black umbrella',
    status: 'lost',
    resolved: false,
    institution: 'IIITD',
    category: 'Accessories',
    userId: 'initial_user_6'
  }
];
