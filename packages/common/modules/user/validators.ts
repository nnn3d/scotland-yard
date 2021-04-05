import { GUEST_USER } from 'common/modules/user/redux'

export const loginValidator = (value: string) => {
  if (!value) return 'Обязательное поле'
  if (value.length < 4) return 'Минимум 4 символа'
  if (value.length > 12) return 'Максимум 12 символов'
  if (!/^[a-z0-9_]+$/i.test(value))
    return 'Доступны только латинские символы, цифры и нижнее подчеркивание'
  if (value === GUEST_USER) return 'Данный логин занят'
}

export const emailValidator = (value: string) => {
  if (!value) return 'Обязательное поле'
  if (!/^[^@.]+@[^@.]+\.[^@]+$/.test(value)) return 'Некорректная почта'
}

export const passwordValidator = (value: string) => {
  if (!value) return 'Обязательное поле'
  if (value.length < 6) return 'Минимум 6 символов'
  if (value.length > 100) return 'Максимум 100 символов'
  if (!/^[a-z0-9!@$%&*()_+\-]+$/i.test(value))
    return 'Доступны только латинские буквы, цифры и символы !@$%&*()_-+'
}
