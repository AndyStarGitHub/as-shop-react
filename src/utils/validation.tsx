interface OrderInfo {
  name: string
  phone: string
  address: string
}
  
export const isPhoneValid = (phone: string) => {
const phoneRegEx = /^\+?3?8?(0\d{9})$/
return phoneRegEx.test(phone)
}

export const isNameValid = (name: string) => {
return name.trim().length >= 2
}

export const isOrderFormValid=(info: OrderInfo): boolean => {
return isNameValid(info.name) && isPhoneValid(info.phone) && info.address.trim().length >= 5
} 