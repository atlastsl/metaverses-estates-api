import { OIDictionary } from '../../../main/types/types';

export const Collections_DICT: OIDictionary = {
    decentraland: [
        {
            lang: 'en',
            value: 'Decentraland',
        },
        {
            lang: 'fr',
            value: 'Decentraland',
        },
    ],
    sandbox: [
        {
            lang: 'en',
            value: 'The Sandbox',
        },
        {
            lang: 'fr',
            value: 'The Sandbox',
        },
    ],
    cryptovoxels: [
        {
            lang: 'en',
            value: 'Crypto Voxels',
        },
        {
            lang: 'fr',
            value: 'Crypto Voxels',
        },
    ],
    'somnium-space': [
        {
            lang: 'en',
            value: 'Somnium Space',
        },
        {
            lang: 'fr',
            value: 'Somnium Space',
        },
    ],
};

export const AssetsTypes_DICT: OIDictionary = {
    land: [
        {
            lang: 'en',
            value: 'Parcel',
        },
        {
            lang: 'fr',
            value: 'Parcelle',
        },
    ],
    estate: [
        {
            lang: 'en',
            value: 'Estate',
        },
        {
            lang: 'fr',
            value: 'Domaine',
        },
    ],
    district: [
        {
            lang: 'en',
            value: 'District',
        },
        {
            lang: 'fr',
            value: 'District',
        },
    ],
};

export function buildReturnDict(
    keys: string[],
    baseDict: OIDictionary,
): OIDictionary {
    return keys
        .map((key: string): OIDictionary => {
            const val = baseDict[key] || [];
            return { [key]: val };
        })
        .filter((a) => !!Object.values(a).length)
        .reduce((a, b) => ({ ...a, ...b }), {});
}
