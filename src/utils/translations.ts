import { Translations, TranslationsNonNull } from '../types'

export function getTranslations(
  translations: Translations = {},
): TranslationsNonNull {
  return {
    cardNumber: 'Card Number',
    cardHolderName: 'Name on card',
    nameSurname: 'Name Surname',
    mmYY: 'MM/YY',
    expiration: 'Expiration date (MM/YY)',
    securityCode: 'CVV',
    zipCode: 'Zip code',
    next: 'Next',
    done: 'Done',
    cardNumberRequired: 'Card number is required.',
    cardNumberInvalid: 'This card number looks invalid.',
    cardHolderNameRequired: 'Cardholder name is required.',
    cardHolderNameInvalid: 'This cardholder name looks invalid.',
    expirationRequired: 'Expiration date is required.',
    expirationInvalid: 'This expiration date looks invalid.',
    securityCodeRequired: 'Security code is required.',
    securityCodeInvalid: 'This security date looks invalid.',
    zipCodeRequired: 'Zip code is required.',
    ...translations,
  }
}
