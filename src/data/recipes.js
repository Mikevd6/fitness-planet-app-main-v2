const recipes = [
  {
    id: 1,
    title: "Gezonde Griekse Salade",
    description: "Een frisse en gezonde Griekse salade met feta kaas en olijven.",
    imageUrl: "/images/recipes/greek-salad.jpg",
    calories: 320,
    prepTime: 15,
    macros: {
      Koolhydraten: { grams: 10, percentage: 20 },
      Eiwitten: { grams: 12, percentage: 35 },
      Vetten: { grams: 25, percentage: 45 }
    },
    ingredients: [
      "200g romaine sla, gewassen en grof gesneden",
      "1 komkommer, in plakjes",
      "200g cherrytomaatjes, gehalveerd",
      "1 rode ui, in dunne ringen",
      "100g feta kaas, verkruimeld",
      "50g Kalamata olijven, ontpit",
      "2 eetlepels olijfolie extra vierge",
      "1 eetlepel rode wijnazijn",
      "1 theelepel gedroogde oregano",
      "Zout en peper naar smaak"
    ],
    instructions: [
      "Combineer de sla, komkommer, tomaten en rode ui in een grote saladeschaal.",
      "Voeg de feta kaas en olijven toe.",
      "In een kleine kom, meng de olijfolie, rode wijnazijn, oregano, zout en peper.",
      "Giet de dressing over de salade en meng voorzichtig.",
      "Serveer direct voor de beste smaak en frisheid."
    ]
  },
  {
    id: 2,
    title: "Proteïne Smoothie Bowl",
    description: "Romige smoothie bowl met eiwitpoeder en vers fruit.",
    imageUrl: "/images/recipes/default-recipe.jpg",
    calories: 450,
    prepTime: 10,
    macros: {
      Koolhydraten: { grams: 50, percentage: 45 },
      Eiwitten: { grams: 30, percentage: 40 },
      Vetten: { grams: 12, percentage: 15 }
    },
    ingredients: [
      "1 bevroren banaan",
      "200g bevroren gemengde bessen",
      "30g vanille eiwitpoeder",
      "150ml amandelmelk",
      "1 eetlepel honing of ahornsiroop",
      "Toppings: granola, vers fruit, kokosrasp, chiazaad"
    ],
    instructions: [
      "Doe de bevroren banaan, bessen, eiwitpoeder en amandelmelk in een blender.",
      "Blend tot een gladde, dikke consistentie. Voeg indien nodig meer amandelmelk toe.",
      "Giet de smoothie in een kom.",
      "Top af met granola, vers fruit, kokosrasp en chiazaad.",
      "Voeg honing of ahornsiroop toe naar smaak."
    ]
  },
  {
    id: 3,
    title: "Kip Quinoa Bowl",
    description: "Voedzame quinoa bowl met gegrilde kip en groenten.",
    imageUrl: "/images/recipes/quinoa-bowl.jpg",
    calories: 520,
    prepTime: 25,
    macros: {
      Koolhydraten: { grams: 45, percentage: 35 },
      Eiwitten: { grams: 35, percentage: 45 },
      Vetten: { grams: 18, percentage: 20 }
    },
    ingredients: [
      "150g quinoa, gespoeld",
      "300ml kippenbouillon",
      "200g kipfilet",
      "1 eetlepel olijfolie",
      "1 theelepel paprikapoeder",
      "1/2 theelepel komijnpoeder",
      "1 avocado, in plakjes",
      "100g cherrytomaatjes, gehalveerd",
      "50g babyspinazie",
      "Sap van 1/2 citroen",
      "Zout en peper naar smaak"
    ],
    instructions: [
      "Kook de quinoa in de kippenbouillon volgens de aanwijzingen op de verpakking.",
      "Kruid de kipfilet met paprikapoeder, komijn, zout en peper.",
      "Verhit olijfolie in een pan en bak de kip 6-7 minuten aan elke kant tot deze gaar is.",
      "Laat de kip 5 minuten rusten en snijd in plakjes.",
      "Verdeel de gekookte quinoa over kommen.",
      "Top met de gegrilde kip, avocado, cherrytomaatjes en babyspinazie.",
      "Besprenkel met citroensap en breng op smaak met zout en peper."
    ]
  },
  {
    id: 4,
    title: "Zalm met Groenten",
    description: "Gebakken zalm met seizoensgroenten en citroen.",
    imageUrl: "/images/recipes/salmon-vegetables.jpg",
    calories: 480,
    prepTime: 20,
    macros: {
      Koolhydraten: { grams: 12, percentage: 15 },
      Eiwitten: { grams: 38, percentage: 50 },
      Vetten: { grams: 28, percentage: 35 }
    }
  },
  {
    id: 5,
    title: "Vegan Buddha Bowl",
    description: "Kleurrijke vegan buddha bowl met hummus en groenten.",
    imageUrl: "/images/recipes/buddha-bowl.jpg",
    calories: 520,
    prepTime: 30,
    macros: {
      Koolhydraten: { grams: 68, percentage: 55 },
      Eiwitten: { grams: 15, percentage: 20 },
      Vetten: { grams: 22, percentage: 25 }
    }
  },
  {
    id: 6,
    title: "Proteïn Pannenkoeken",
    description: "Eiwitrijke pannenkoeken met Griekse yoghurt en fruit.",
    imageUrl: "/images/recipes/default-recipe.jpg",
    calories: 380,
    prepTime: 15,
    macros: {
      Koolhydraten: { grams: 30, percentage: 35 },
      Eiwitten: { grams: 25, percentage: 40 },
      Vetten: { grams: 14, percentage: 25 }
    }
  }
];

export default recipes;