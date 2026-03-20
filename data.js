const materials = [
    {
        id: "refined_plastic",
        name: "Plástico Refinado",
        image: "assets/images/refined-plastic.png",
        price: 6
    },
    {
        id: "refined_scrap",
        name: "Sucata Refinada",
        image: "assets/images/refined-scrap.png",
        price: 6
    },
    {
        id: "refined_rubber",
        name: "Borracha Refinada",
        image: "assets/images/refined-rubber.png",
        price: 6
    },
    {
        id: "refined_glass",
        name: "Vidro Refinado",
        image: "assets/images/refined-glass.png",
        price: 6
    },
    {
        id: "refined_copper",
        name: "Cobre Refinado",
        image: "assets/images/refined-copper.png",
        price: 6
    },
    {
        id: "refined_aluminum",
        name: "Alumínio Refinado",
        image: "assets/images/refined-aluminum.png",
        price: 6
    }
];

const components = [
    {
        id: "ecu",
        name: "ECU",
        image: "assets/images/ecu_stage1.png",
        stage: 1,
        sellPrice: 7500,
        ingredients: [
            { id: "refined_copper", quantity: 100 },
            { id: "refined_plastic", quantity: 100 },
            { id: "refined_scrap", quantity: 100 },
            { id: "refined_aluminum", quantity: 100 }
        ]
    },
    {
        id: "brake_kit",
        name: "Kit de Freio",
        image: "assets/images/brake_kit.png",
        stage: 2,
        sellPrice: 13750,
        ingredients: [
            { id: "refined_plastic", quantity: 240 },
            { id: "refined_scrap", quantity: 240 },
            { id: "refined_rubber", quantity: 240 },
            { id: "refined_copper", quantity: 240 },
            { id: "refined_aluminum", quantity: 240 }
        ]
    },
    {
        id: "air_filter",
        name: "Filtro de Ar",
        image: "assets/images/sport_air_filter.png",
        stage: 2,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    },
    {
        id: "sport_exhaust",
        name: "Escapamento Esportivo",
        image: "assets/images/sport_exhaust.png",
        stage: 2,
        sellPrice: 15000,
        ingredients: [
            { id: "refined_scrap", quantity: 500 },
            { id: "refined_copper", quantity: 500 },
            { id: "refined_aluminum", quantity: 500 }
        ]
    },
    {
        id: "big_turbo",
        name: "Turbina",
        image: "assets/images/big_turbo.png",
        stage: 3,
        sellPrice: 18800,
        ingredients: [
            { id: "refined_plastic", quantity: 400 },
            { id: "refined_rubber", quantity: 400 },
            { id: "refined_scrap", quantity: 400 },
            { id: "refined_copper", quantity: 400 }
        ]
    },
    {
        id: "intercooler",
        name: "Intercooler",
        image: "assets/images/intercooler.png",
        stage: 3,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    },
    {
        id: "suspension_5",
        name: "Kit de Suspensão",
        image: "assets/images/suspension_5.png",
        stage: 3,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    },
    {
        id: "racing_clutch",
        name: "Embreagem Esportiva",
        image: "assets/images/racing_clutch.png",
        stage: 3,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    },
    {
        id: "intake_manifold",
        name: "Coletor de Admissão",
        image: "assets/images/intake_manifold.png",
        stage: 3,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    },
    {
        id: "fuel_system",
        name: "Sistema de Combustível",
        image: "assets/images/fuel_system_upgrade.png",
        stage: 3,
        sellPrice: 9400,
        ingredients: [
            { id: "refined_plastic", quantity: 200 },
            { id: "refined_rubber", quantity: 200 },
            { id: "refined_scrap", quantity: 200 },
            { id: "refined_copper", quantity: 200 }
        ]
    }
];