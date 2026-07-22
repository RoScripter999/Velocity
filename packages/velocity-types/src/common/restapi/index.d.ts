// please keep in alphabetical order
export * from "./hypesquad-online";
export * from "./users-me-profile";
export * from "./users-me-settings";
export * from "./virtual-currency-skus-redeem";

import type { HypeSquadOnlinePayload, UserMeProfileGetResponse, UserMeProfilePayload, UserMeSettingsGetResponse, UserMeSettingsPayload, VirtualCurrencySkusRedeemPayload, VirtualCurrencySkusRedeemGetResponse } from "..";

/**
 * If you want to contribute to endpoints or add more Discord endpoints, follow these rules:
 * - 1. Make sure you type all methods with the correct types.
 * - 2. Make sure you test all methods and add comments like the rest of the endpoints below.
 * - 3. Make sure your comments explain what each field does, and they must be human-written (comments must include a JSDoc "@description").
 * - 4. Do NOT type fields as "any" or "unknown". RestAPI velocity types must include **ALL** fields and params.
 * - 5. **IMPORTANT** Make sure your types are API-based, not JSON-based
 */
export type PostPayloads = HypeSquadOnlinePayload | UserMeProfilePayload | UserMeSettingsPayload | VirtualCurrencySkusRedeemPayload;

export type GetPayloads<TUrl extends string> =
    TUrl extends `/users/${string}/profile` ? UserMeProfileGetResponse :
    TUrl extends `/users/${string}/settings` ? UserMeSettingsGetResponse :
    TUrl extends `/virtual-currency/skus/${string}/redeem` ? VirtualCurrencySkusRedeemGetResponse :
    { [key: string]: any; };

