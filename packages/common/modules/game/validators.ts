export function validateGameName(value: string) {
  if (!value) return 'Обязательное поле'
  if (value.length < 4) return 'Минимум 4 символа'
  if (value.length > 20) return 'Максимум 20 символов'
  if (!/^[a-z0-9 ]+$/i.test(value))
    return 'Доступны только латинские символы, цифры и пробелы'
}
