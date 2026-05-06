import { useLocalStorage } from '@vueuse/core'

export const useLayout = () => {
  const isFluid = useLocalStorage('iiot-layout-fluid', false)

  const toggleWidth = () => {
    isFluid.value = !isFluid.value
  }

  return {
    isFluid,
    toggleWidth
  }
}
