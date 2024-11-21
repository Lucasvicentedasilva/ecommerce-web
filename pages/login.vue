<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster, toast } from 'vue-sonner'
import { useCookie } from '#app'

// Interface para a resposta da API
interface LoginResponse {
  token: string
}

// Variáveis reativas para login
const email = ref('')
const password = ref('')
const router = useRouter()

// Referência ao cookie para o token
const authToken = useCookie('auth_token', { maxAge: 60 * 60 * 24 }) // Expiração: 1 dia

const loginUser = async () => {
  try {
    // Tipar o retorno do $fetch
    const response = await $fetch<LoginResponse>('http://localhost:3333/session', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })

    // Verificar e salvar o token no cookie
    if (response.token) {
      authToken.value = response.token
      toast.success('Login realizado com sucesso!')

      // Redirecionar para a rota index
      setTimeout(() => {
        router.push('/')
      }, 1000) // 1 segundo ante do redirecionamento
    }
  } catch (error) {
    toast.error('Erro ao fazer login. Verifique suas credenciais e tente novamente.')
  }
}
</script>

<template>
  <Card class="mx-auto max-w-sm my-28">
    <CardHeader>
      <CardTitle class="text-xl">
        Entrar
      </CardTitle>
      <CardDescription>
        Faça login para continuar usando o site.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            v-model="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Senha</Label>
          <Input
            id="password"
            type="password"
            v-model="password"
            placeholder="Digite sua senha"
            required
          />
        </div>
        <Button @click="loginUser" class="w-full">
          Entrar
        </Button>
      </div>
      <div class="mt-4 text-center text-sm">
        Não possui uma conta?
        <NuxtLink to="/signup" class="underline">
          Criar conta
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
  <Toaster />
</template>
