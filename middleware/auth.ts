import { defineNuxtRouteMiddleware, useCookie } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie('auth_token')

  // Se o token não existir, redirecione para a página de login
  if (!authToken.value) {
    return navigateTo('/login')
  }
})