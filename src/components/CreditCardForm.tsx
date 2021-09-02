import React, { useRef, useState, useEffect } from 'react'
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useFormContext } from 'react-hook-form'
import cardValidator from 'card-validator'
import FormTextField from './FormTextField'
import {
  cardNumberFormatter,
  expirationDateFormatter,
} from '../utils/formatters'
import LibraryContext from '../LibraryContext'
import CardIcon from './CardIcon'
import FormCard from './FormCard'
import { getTranslations } from '../utils/translations'
import { CardFields, LibraryProps } from '../types'

const CreditCardForm: React.FC<LibraryProps> = (props) => {
  const { horizontalStart = true, translations: parentTranslations } = props
  const translations = getTranslations(parentTranslations)
  const { trigger, watch } = useFormContext()
  const cardNumber = watch('cardNumber')
  const { card } = cardValidator.number(cardNumber)
  const isAmex = card?.type === 'american-express'
  const cvvLength = isAmex ? 4 : 3

  const [isHorizontal, setIsHorizontal] = useState(
    horizontalStart && Platform.OS === 'ios',
  )

  const { width: windowWidth } = useWindowDimensions()
  // input has 36*2 padding
  const inputWidth = windowWidth - 72

  const scrollRef = useRef<ScrollView>(null)
  const holderNameRef = useRef<TextInput>(null)
  const cardNumberRef = useRef<TextInput>(null)
  const expirationRef = useRef<TextInput>(null)
  const cvvRef = useRef<TextInput>(null)
  const zipCodeRef = useRef<TextInput>(null)

  const [focusedField, setFocusedField] = useState<CardFields | null>(null)

  useEffect(() => {
    if (cardNumberRef?.current) {
      cardNumberRef.current.focus()
    }
  }, [cardNumberRef])

  const textFieldStyle = isHorizontal
    ? [
        styles.textField,
        {
          width: inputWidth,
        },
      ]
    : styles.regularField

  async function goNext() {
    if (focusedField === null) return

    const field = ['cardNumber', 'holderName', 'expiration', 'cvv', 'zipCode'][
      focusedField
    ]

    if (isHorizontal) {
      const result = await trigger(field)
      if (!result) return
      scrollRef.current?.scrollTo({ x: (focusedField + 1) * inputWidth })
    }

    if (focusedField === CardFields.ZipCode) {
      setFocusedField(null)
      setIsHorizontal(false)
      Keyboard.dismiss()
      return
    }

    const ref = [cardNumberRef, holderNameRef, expirationRef, cvvRef, zipCodeRef][
      focusedField + 1
    ]
    ref.current?.focus()
  }

  return (
    <LibraryContext.Provider
      value={{
        ...props,
        overrides: props.overrides || {},
        fonts: {
          regular: props.fonts?.regular || 'RobotoMono_400Regular',
          bold: props.fonts?.bold || 'RobotoMono_700Bold',
        },
        translations,
      }}
    >
      <View style={styles.container}>
        <FormCard cardType={card?.type} focusedField={focusedField} />
        <ScrollView
          ref={scrollRef}
          style={isHorizontal && { maxHeight: 120 }}
          pagingEnabled={isHorizontal}
          horizontal={isHorizontal}
          scrollEnabled={!isHorizontal}
          keyboardShouldPersistTaps="handled"
        >
          <FormTextField
            style={textFieldStyle}
            ref={cardNumberRef}
            name="cardNumber"
            label={translations.cardNumber}
            keyboardType="number-pad"
            maxLength={19}
            validationLength={isAmex ? 18 : 19}
            rules={{
              required: translations.cardNumberRequired,
              validate: {
                isValid: (value: string) => {
                  return (
                    cardValidator.number(value).isValid ||
                    translations.cardNumberInvalid
                  )
                },
              },
            }}
            formatter={cardNumberFormatter}
            endEnhancer={<CardIcon cardNumber={cardNumber} />}
            onFocus={() => setFocusedField(CardFields.CardNumber)}
            onValid={goNext}
          />
          <FormTextField
            style={textFieldStyle}
            ref={holderNameRef}
            name="holderName"
            label={translations.cardHolderName}
            maxLength={100}
            rules={{
              required: translations.cardHolderNameRequired,
              validate: {
                isValid: (value: string) => {
                  return (
                    cardValidator.cardholderName(value).isValid ||
                    'This cardholder name looks invalid.'
                  )
                },
              },
            }}
            autoCorrect={false}
            onSubmitEditing={goNext}
            onFocus={() => setFocusedField(CardFields.CardHolderName)}
          />
          <View style={styles.row}>
            <FormTextField
              style={[
                textFieldStyle,
                {
                  marginRight: isHorizontal ? 0 : 24,
                },
              ]}
              ref={expirationRef}
              name="expiration"
              label={translations.expiration}
              keyboardType="number-pad"
              maxLength={5}
              validationLength={5}
              rules={{
                required: translations.expirationRequired,
                validate: {
                  isValid: (value: string) => {
                    return (
                      cardValidator.expirationDate(value).isValid ||
                      translations.expirationInvalid
                    )
                  },
                },
              }}
              formatter={expirationDateFormatter}
              onFocus={() => setFocusedField(CardFields.Expiration)}
              onValid={goNext}
            />
            <FormTextField
              style={textFieldStyle}
              ref={cvvRef}
              name="cvv"
              label={translations.securityCode}
              keyboardType="number-pad"
              maxLength={cvvLength}
              validationLength={cvvLength}
              rules={{
                required: 'Security code is required.',
                validate: {
                  isValid: (value: string) => {
                    return (
                      cardValidator.cvv(value, cvvLength).isValid ||
                      'This security code looks invalid.'
                    )
                  },
                },
              }}
              onFocus={() => setFocusedField(CardFields.CVV)}
              onValid={goNext}
            />
          </View>
          <FormTextField
            style={textFieldStyle}
            ref={zipCodeRef}
            name="zipCode"
            label={translations.zipCode}
            rules={{
              required: translations.zipCodeRequired,
              minLength: {
                value: 2,
                message: 'Enter a zip code with at least 2 characters and at most 10 characters containing letters, digits, spaces and - only.'
              },
              validate: {},
            }}
            maxLength={10}
            autoCorrect={false}
            onFocus={() => setFocusedField(CardFields.ZipCode)}
          />
        </ScrollView>
      </View>
    </LibraryContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  textField: {
    marginTop: 24,
    height: 100,
  },
  regularField: {
    flex: 1,
    marginTop: 24,
  },
})

export default CreditCardForm
