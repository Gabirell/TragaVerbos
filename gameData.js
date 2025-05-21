// gameData.js

const basePronounsForGeneration = [
    "yo", "tú", "vos", "él", "ella",
    "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas"
];

// NOTA: Para los pronombres "él" y "ella" (y sus plurales), la conjugación es la misma.
// Al generar las ruedas o validar, si se selecciona "él", también se aceptará "ella" con la misma forma verbal y viceversa.
// Similar para nosotros/nosotras y vosotros/vosotras, ellos/ellas.
// El script principal manejará esto al poblar las ruedas y al validar.

const verbDetails = {
    'cantar': {
        conjugations: {
            'present': { "yo": "canto", "tú": "cantas", "vos": "cantás", "él": "canta", "ella": "canta", "nosotros": "cantamos", "nosotras": "cantamos", "vosotros": "cantáis", "vosotras": "cantáis", "ellos": "cantan", "ellas": "cantan" },
            'past': { "yo": "canté", "tú": "cantaste", "vos": "cantaste", "él": "cantó", "ella": "cantó", "nosotros": "cantamos", "nosotras": "cantamos", "vosotros": "cantasteis", "vosotras": "cantasteis", "ellos": "cantaron", "ellas": "cantaron" },
            'future': { "yo": "cantaré", "tú": "cantarás", "vos": "cantarás", "él": "cantará", "ella": "cantará", "nosotros": "cantaremos", "nosotras": "cantaremos", "vosotros", "cantaréis", "vosotras", "cantaréis", "ellos": "cantarán", "ellas": "cantarán" }
        },
        specificEndings: ['canciones', 'ópera', 'baladas', 'conmigo', 'sola', 'solo', 'juntos', 'juntas', 'feliz', 'alto', 'bajo']
    },
    'comer': {
        conjugations: {
            'present': { "yo": "como", "tú": "comes", "vos": "comés", "él": "come", "ella": "come", "nosotros": "comemos", "nosotras": "comemos", "vosotros": "coméis", "vosotras": "coméis", "ellos": "comen", "ellas": "comen" },
            'past': { "yo": "comí", "tú": "comiste", "vos": "comiste", "él": "comió", "ella": "comió", "nosotros": "comimos", "nosotras": "comimos", "vosotros": "comisteis", "vosotras": "comisteis", "ellos": "comieron", "ellas": "comieron" },
            'future': { "yo": "comeré", "tú": "comerás", "vos": "comerás", "él": "comerá", "ella": "comerá", "nosotros": "comeremos", "nosotras": "comeremos", "vosotros", "comeréis", "vosotras", "comeréis", "ellos", "comerán", "ellas": "comerán" }
        },
        specificEndings: ['pizza', 'fruta', 'sopa', 'pan', 'tacos', 'ensalada', 'contigo', 'rápido', 'lento']
    },
    'vivir': {
        conjugations: {
            'present': { "yo": "vivo", "tú": "vives", "vos": "vivís", "él": "vive", "ella": "vive", "nosotros": "vivimos", "nosotras": "vivimos", "vosotros": "vivís", "vosotras": "vivís", "ellos": "viven", "ellas": "viven" },
            'past': { "yo": "viví", "tú": "viviste", "vos": "viviste", "él": "vivió", "ella": "vivió", "nosotros": "vivimos", "nosotras": "vivimos", "vosotros": "vivisteis", "vosotras", "vivisteis", "ellos": "vivieron", "ellas": "vivieron" },
            'future': { "yo": "viviré", "tú": "vivirás", "vos": "vivirás", "él": "vivirá", "ella": "vivirá", "nosotros": "viviremos", "nosotras": "viviremos", "vosotros", "viviréis", "vosotras", "viviréis", "ellos", "vivirán", "ellas": "vivirán" }
        },
        specificEndings: ['experiencias', 'aventuras', 'la vida', 'el momento', 'contigo', 'feliz', 'cerca', 'lejos', 'solo', 'sola']
    }
    // Puedes añadir más verbos aquí:
    // 'hablar': { conjugations: { ... }, specificEndings: [...] },
    // 'escribir': { conjugations: { ... }, specificEndings: [...] },
};

// Palabras finales que son generalmente aceptables como adverbios o complementos circunstanciales
// y que podrían ir con la mayoría de los verbos si la conjugación es correcta.
const generalAcceptableEndingsGlobal = [
    "bien", "mal", "aquí", "allí", "hoy", "mañana", "ayer", "siempre",
    "nunca", "mucho", "poco", "rápido", "lento", "alto", "bajo",
    "feliz", "contento", "triste", "despacio", "juntos", "juntas", // Para plurales
    "solo", "sola" // Para singulares (podríamos añadir 'solos', 'solas' si hacemos concordancia fina)
];

// Para el futuro, podrías tener un generador de conjugaciones para verbos regulares
// Ejemplo (conceptual, no usado directamente por el script.js actual):
/*
function conjugateRegular(verbRoot, type, tense, pronoun) {
    // type: 'ar', 'er', 'ir'
    // Lógica para añadir terminaciones correctas...
    // ej: if type === 'ar' && tense === 'present' && pronoun === 'yo' return verbRoot + 'o';
    return "conjugacion_calculada";
}
*/