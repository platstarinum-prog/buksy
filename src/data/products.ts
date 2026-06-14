import { Product, Review } from '../types';

export const products: Product[] = [
  {
    "id": "4",
    "name": "ABYSS CARGO PANTS",
    "slug": "abyss-cargo-pants",
    "price": 209,
    "category": "pants",
    "images": [
      "https://images.pexels.com/photos/12982896/pexels-photo-12982896.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1598503/pexels-photo-1598503.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "28",
        "available": true
      },
      {
        "name": "30",
        "available": true
      },
      {
        "name": "32",
        "available": true
      },
      {
        "name": "34",
        "available": true
      },
      {
        "name": "36",
        "available": false
      }
    ],
    "inStock": true,
    "isNew": true,
    "rating": 4.7,
    "shortDescription": "Технічна японська тканина з перебільшеними карго-кишенями",
    "description": "Abyss Cargo Pants переосмислюють утилітарну розкіш. Виготовлені з технічної японської тканини з легким блиском, ці штани мають перебільшені карго-кишені, регульовані ремені та вільний крій у стегнах, що звужується до щиколотки.",
    "details": [
      "Технічна японська тканина",
      "Вільний крій, звужені штанини",
      "Шість карго-кишень",
      "Регульовані ремені на щиколотках",
      "Внутрішній регульований пояс"
    ],
    "reviews": []
  },
  {
    "id": "5",
    "name": "BLOOD MOON CHAIN",
    "slug": "blood-moon-chain",
    "price": 149,
    "category": "accessories",
    "images": [
      "https://images.pexels.com/photos/11229341/pexels-photo-11229341.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/12982896/pexels-photo-12982896.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/723509/pexels-photo-723509.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "18\"",
        "available": true
      },
      {
        "name": "20\"",
        "available": true
      },
      {
        "name": "22\"",
        "available": true
      },
      {
        "name": "24\"",
        "available": false
      }
    ],
    "inStock": true,
    "isFeatured": true,
    "rating": 4.9,
    "shortDescription": "Оксидоване стерлінгове срібло з криваво-червоною емаллю 24k",
    "description": "Blood Moon Chain — це акцентний виріб, що поєднує стрітвір і тонку ювелірну майстерність. Виготовлений вручну з оксидованого стерлінгового срібла з криваво-червоним емалевим акцентом 24k, цей солідний ланцюг важко лежить на шиї, привертаючи увагу, не вимагаючи її.",
    "details": [
      "Оксидоване срібло 925 проби",
      "Криваво-червона емаль 24k",
      "Застібка-лобстер",
      "Поліровані вручну ланки",
      "Вага: 85 г (20\")"
    ],
    "care": [
      "Зберігати в антиоксидному мішечку",
      "Уникати контакту з водою",
      "Полірувати срібною тканиною"
    ],
    "reviews": []
  },
  {
    "id": "6",
    "name": "FALLEN ANGEL BOOTS",
    "slug": "fallen-angel-boots",
    "price": 389,
    "category": "footwear",
    "images": [
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/16196537/pexels-photo-16196537.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "39",
        "available": true
      },
      {
        "name": "40",
        "available": true
      },
      {
        "name": "41",
        "available": true
      },
      {
        "name": "42",
        "available": true
      },
      {
        "name": "43",
        "available": false
      },
      {
        "name": "44",
        "available": true
      }
    ],
    "inStock": true,
    "isNew": true,
    "isBestseller": true,
    "rating": 4.8,
    "shortDescription": "Італійська теляча шкіра з масивною підошвою lug",
    "description": "Черевики Fallen Angel Boots пошиті вручну італійськими майстрами з преміальної телячої шкіри. Мають масивну підошву lug, приховану платформу та швидку шнурівку — поєднують естетику архівної моди з сучасними технологіями комфорту.",
    "details": [
      "Італійська теляча шкіра повного зерна",
      "Прихована платформа 3 см",
      "Швидка шнурівка",
      "Шкіряна внутрішня підкладка",
      "Гумова підошва lug"
    ],
    "care": [
      "Використовувати захист для шкіри перед першим носінням",
      "Чистити вологою тканиною",
      "Кондиціонувати щомісяця",
      "Зберігати зі вставками для взуття"
    ],
    "reviews": [
      {
        "id": "4",
        "author": "Sarah M.",
        "rating": 5,
        "title": "Ідеальна посадка",
        "content": "Нарешті бренд, який розуміє, як одяг має сидіти. Силует чистий, матеріали преміальні, отримую компліменти щоразу.",
        "date": "2023-12-28",
        "verified": true
      }
    ]
  },
  {
    "id": "3",
    "name": "OBSCURA LEATHER JACKET",
    "slug": "obscura-leather-jacket",
    "price": 549,
    "originalPrice": 699,
    "category": "jackets",
    "images": [
      "https://images.pexels.com/photos/1126964/pexels-photo-1126964.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/10409446/pexels-photo-10409446.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/16196537/pexels-photo-16196537.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "S",
        "available": true
      },
      {
        "name": "M",
        "available": true
      },
      {
        "name": "L",
        "available": true
      },
      {
        "name": "XL",
        "available": false
      }
    ],
    "inStock": true,
    "isFeatured": true,
    "isBestseller": true,
    "rating": 5,
    "shortDescription": "Італійська шкіра повного зерна з матовим покриттям",
    "description": "Куртка Obscura Leather Jacket — свідчення витонченої майстерності. Виготовлена з італійської шкіри повного зерна з матовим покриттям, має асиметричні блискавки, приховану внутрішню кишеню та фірмову криваво-червону підкладку. Кожна куртка набуває унікальної патини з часом, стаючи по-справжньому вашою.",
    "details": [
      "Італійська шкіра повного зерна",
      "Криваво-червона шовкова підкладка",
      "Асиметричні блискавки YKK",
      "Чотири зовнішні кишені",
      "Одна прихована внутрішня кишеня"
    ],
    "care": [
      "Тільки професійне чищення шкіри",
      "Зберігати на м'яких плічках",
      "Кондиціонувати шкіряним бальзамом щоквартально"
    ],
    "reviews": [
      {
        "id": "3",
        "author": "Dante R.",
        "rating": 4,
        "title": "Чудова річ",
        "content": "Приголомшливий дизайн і відмінна якість. Зняв зірку через затримку доставки, але сам виріб перевершує всі очікування.",
        "date": "2024-01-05",
        "verified": true
      }
    ]
  },
  {
    "id": "7",
    "name": "RITUAL ZIP HOODIE",
    "slug": "ritual-zip-hoodie",
    "price": 219,
    "category": "hoodies",
    "images": [
      "https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/17854971/pexels-photo-17854971.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "S",
        "available": true
      },
      {
        "name": "M",
        "available": true
      },
      {
        "name": "L",
        "available": false
      },
      {
        "name": "XL",
        "available": true
      }
    ],
    "inStock": true,
    "rating": 4.6,
    "shortDescription": "Подвійний трикотаж з важкої бавовни з матовою чорною фурнітурою",
    "description": "Ritual Zip Hoodie виготовлений з подвійного трикотажу важкої бавовни зі структурованим капюшоном та матовою чорною фурнітурою. Подовжений силует і отвори для пальців створюють безперервний потік від плеча до руки.",
    "details": [
      "Подвійний трикотаж 400 г/м²",
      "Подовжена довжина з боковими розрізами",
      "Матова чорна блискавка",
      "Структурований подвійний капюшон",
      "Отвори для пальців на манжетах"
    ],
    "reviews": []
  },
  {
    "id": "2",
    "name": "SACRIFICE TEE",
    "slug": "sacrifice-tee",
    "price": 89,
    "category": "t-shirts",
    "images": [
      "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/17854971/pexels-photo-17854971.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "XS",
        "available": true
      },
      {
        "name": "S",
        "available": true
      },
      {
        "name": "M",
        "available": true
      },
      {
        "name": "L",
        "available": true
      },
      {
        "name": "XL",
        "available": true
      },
      {
        "name": "XXL",
        "available": true
      }
    ],
    "inStock": true,
    "isFeatured": true,
    "isBestseller": true,
    "rating": 4.8,
    "shortDescription": "Футболка з японської бавовни з графічним принтом ручної роботи",
    "description": "Sacrifice Tee представляє наш культовий принт на преміальній японській бавовні. Кожен виріб проходить унікальний процес прання, що дає ледь помітні варіації та робить кожну футболку єдиною у своєму роді. Вільний крій та посилена горловина забезпечують тривалий комфорт і міцність.",
    "details": [
      "Японська бавовна 180 г/м²",
      "Унікальна обробка stone-wash",
      "Вільний крій",
      "Посилена горловина",
      "Шовкографічний принт"
    ],
    "reviews": [
      {
        "id": "2",
        "author": "Elena K.",
        "rating": 5,
        "title": "Вартує кожної копійки",
        "content": "Сумнівалася щодо ціни, але в момент, коли одягла, все зрозуміла. Майстерність виконання на іншому рівні. Дуже рекомендую.",
        "date": "2024-01-10",
        "verified": true
      }
    ]
  },
  {
    "id": "8",
    "name": "SHADOW TECH PANTS",
    "slug": "shadow-tech-pants",
    "price": 179,
    "category": "pants",
    "images": [
      "https://images.pexels.com/photos/1598503/pexels-photo-1598503.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/10409446/pexels-photo-10409446.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "28",
        "available": false
      },
      {
        "name": "30",
        "available": true
      },
      {
        "name": "32",
        "available": true
      },
      {
        "name": "34",
        "available": true
      },
      {
        "name": "36",
        "available": true
      }
    ],
    "inStock": true,
    "rating": 4.5,
    "shortDescription": "Запатентована тканина shadow-tech з артикульованими колінами",
    "description": "Shadow Tech Pants використовують нашу запатентовану тканину shadow-tech, яка виглядає повністю чорною на прямому світлі, але виявляє тонкий візерунок у тіні. Розроблені для руху з артикульованими колінами та дихаючими панелями.",
    "details": [
      "Запатентована тканина shadow-tech",
      "Водовідштовхувальне покриття",
      "Артикульовані коліна",
      "Приховані кишені на блискавці",
      "Еластичний манжет"
    ],
    "reviews": []
  },
  {
    "id": "1",
    "name": "VOID OVERSIZED HOODIE",
    "slug": "void-oversized-hoodie",
    "price": 189,
    "category": "hoodies",
    "images": [
      "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/17854971/pexels-photo-17854971.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    "sizes": [
      {
        "name": "XS",
        "available": true
      },
      {
        "name": "S",
        "available": true
      },
      {
        "name": "M",
        "available": true
      },
      {
        "name": "L",
        "available": true
      },
      {
        "name": "XL",
        "available": true
      },
      {
        "name": "XXL",
        "available": false
      }
    ],
    "inStock": true,
    "isNew": true,
    "isFeatured": true,
    "isBestseller": false,
    "rating": 4.9,
    "shortDescription": "Преміальний оверсайз худі з важкої бавовни з вишитим логотипом",
    "description": "Виготовлений з преміальної важкої бавовни, Void Oversized Hoodie втілює суть мінімалістичної темряви. Перебільшений силует, посилені шви та наша фірмова вишита емблема — цей виріб є вершиною розкішного стрітвіру. Спущені плечі та подовжена довжина створюють драматичний, текучий силует.",
    "details": [
      "100% преміальна важка бавовна (400 г/м²)",
      "Оверсайз крій зі спущеними плечима",
      "Ребристі манжети та низ",
      "Кишеня-кенгуру",
      "Вишитий логотип на грудях"
    ],
    "care": [
      "Прати в машині на холодному режимі, вивернувши навиворіт",
      "Не відбілювати",
      "Сушити в машині на низькому режимі",
      "Прасувати з вивороту за потреби"
    ],
    "reviews": [
      {
        "id": "1",
        "author": "Marcus V.",
        "rating": 5,
        "title": "Виняткова якість",
        "content": "Увага до деталей неймовірна. Вага тканини ідеальна, крій саме такий, як описано. Це тепер мій основний вибір для якісного стрітвіру.",
        "date": "2024-01-15",
        "verified": true
      }
    ]
  }
];

export const reviews: Review[] = products.flatMap(p => (p.reviews || []).map((r: Review) => ({ ...r, productId: p.id, productSlug: p.slug })));

export const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {"pants":"Pants","accessories":"Accessories","footwear":"Footwear","jackets":"Jackets","hoodies":"Hoodies","t-shirts":"T-Shirts"};
  return names[category] || category;
};

export const categories = [{"id":"all","name":"All"},{"id":"pants","name":"Pants"},{"id":"accessories","name":"Accessories"},{"id":"footwear","name":"Footwear"},{"id":"jackets","name":"Jackets"},{"id":"hoodies","name":"Hoodies"},{"id":"t-shirts","name":"T-Shirts"}];

export const heroImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200';
export const editorialImage = 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800';
