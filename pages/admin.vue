<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">LUCAS STORE - Admin</h1>
        <nav class="hidden md:flex items-center space-x-4">
          <Button variant="ghost" @click="goToIndex">Voltar para Loja</Button>
        </nav>
        <DropdownMenu :open="isDropdownOpen" @close="closeDropdown">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" class="relative h-8 w-8 rounded-full" @click.stop="toggleDropdown">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            v-if="isDropdownOpen"
            class="w-56"
            align="end"
            forceMount
            @click.stop
          >
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">Lucas Silva</p>
                <p class="text-xs leading-none text-muted-foreground">
                  lucas@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="goToIndex">
              <Home class="mr-2 h-4 w-4" />
              <span>Loja</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="logout">
              <LogOut class="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <AdminProductManagement :fetch-products="fetchProducts" :products="products" />
    </main>

    <footer class="bg-muted py-8 mt-8">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 Lucas Silva. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
  <Toaster />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import AdminProductManagement from '/components/AdminProductManagement.vue'
import { Toaster, toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const isDropdownOpen = ref(false)
const products = ref([])

// Função para buscar produtos da API
const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3333/products')
    if (!response.ok) throw new Error('Erro ao buscar os produtos.')
    products.value = await response.json()
  } catch (error) {
    toast.error(error.message)
  }
}

// Busca inicial de produtos
onMounted(() => {
  fetchProducts()
})

// Alterna o estado do dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Fecha o dropdown ao clicar fora
const closeDropdown = (event) => {
  if (event && event.target.closest('.DropdownMenuContent')) return
  isDropdownOpen.value = false
}

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const goToIndex = () => {
  router.push('/') // Rota para a página inicial
}

const logout = () => {
  const authToken = useCookie('auth_token')
  authToken.value = null // Remove o token
  navigateTo('/login')
  toast.success('Você saiu com sucesso.')

}
</script>
