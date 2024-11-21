<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'
import { Toaster, toast } from 'vue-sonner'


const username = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()

const createUser = async () => {
  try {
    const response = await $fetch('http://localhost:3333/users', {
      method: 'POST',
      body: {
        username: username.value,
        email: email.value,
        password: password.value,
      },
    })

    if (response) {
      toast.success('Usuário criado com sucesso!')
      setTimeout(() => {
        router.push('/login')
      }, 3000) // 3 segundos antes do redirecionamento
    }
  } catch (error) {
    toast.error('Erro ao criar usuário. Verifique os dados e tente novamente.')
  }
}
</script>

<template>
  <Card class="mx-auto max-w-sm my-28">
    <CardHeader>
      <CardTitle class="text-xl">
        Criar conta
      </CardTitle>
      <CardDescription>
        Crie sua conta para começar a usar o nosso site.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid">
          <div class="grid gap-2">
            <Label for="username">Nome</Label>
            <Input
              id="username"
              v-model="username"
              placeholder="Max Silva"
              required
            />
          </div>
        </div>
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
            required
          />
        </div>
        <Button @click="createUser" class="w-full">
          Criar conta
        </Button>
      </div>
      <div class="mt-4 text-center text-sm">
        Já possui uma conta?
        <NuxtLink to="/login" class="underline">
          Entrar
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
  <Toaster />
</template>
