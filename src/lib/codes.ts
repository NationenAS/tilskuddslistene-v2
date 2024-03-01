export const selectableCodes: { 
    id: string;
    codes: string[];
    textShort: string;
    textLong: string;
    unit: string;
}[] = [
    // {
    //     id: 'sum',
    //     codes: ["sum_produksjons_og_avloesertilskudd"],
    //     textShort: "Alle",
    //     textLong: "Sum produksjons- og avløsertilskudd",
    //     unit: "kr"
    // },
    {
        id: 'fruit',
        codes: ['p272', 'p273', 'p274', 'p283'],
        textShort: "Frukt",
        textLong: "Epler, pærer, plommer, andre fruktarter",
        unit: "dekar"
    },
    {
        id: 'berries',
        codes: ['p271', 'p280', 'p282'],
        textShort: "Bær",
        textLong: "Jordbær, moreller og kirsebær, andre bærarter",
        unit: "dekar"
    },
    {
        id: 'grains',
        codes: ['p238', 'p239', 'p240', 'p242', 'p243', 'p247'],
        textShort: "Kønn",
        textLong: "Bygg, havre, hvete, rug, andre kornarter",
        unit: "dekar"
    },
    {
        id: 'autumnWheat',
        codes: ['p247'],
        textShort: "Høsthvete",
        textLong: "Høsthvete",
        unit: "dekar"
    }

]