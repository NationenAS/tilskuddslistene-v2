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
    }
]