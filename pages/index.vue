

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">LUCAS STORE</h1>
        
        <div class="flex items-center space-x-4">
          <Button variant="outline" @click="isCartOpen = true" class="relative">
            <ShoppingCart class="h-5 w-5" />
            <span class="sr-only">Carrinho de compras</span>
            <Badge v-if="cart.length > 0" class="absolute -top-2 -right-2">{{ cart.length }}</Badge>
          </Button>
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
    <DropdownMenuItem @click="goToAdmin">
      <Settings class="mr-2 h-4 w-4" />
      <span>Admin</span>
    </DropdownMenuItem>
    <DropdownMenuItem @click="logout">
      <LogOut class="mr-2 h-4 w-4" />
      <span>Log out</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
        </div>
      </div>
    </header>

    <main class="container mx-auto h-full px-4 py-8">
      <h2 class="text-3xl font-bold mb-6">Nossos Produtos</h2>

      <div class="mb-6">
        <Label for="category">Filtrar por categoria:</Label>
        <Select v-model="selectedCategory">
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="category in categories" :key="category" :value="category">
              {{ category === 'all' ? 'Todas as categorias' : category.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card v-for="product in filteredProducts" :key="product.id">
          <CardContent class="p-0">
            <img :src="`http://localhost:3333/uploads/${product.image}`" :alt="product.name" class="w-full h-48 object-cover rounded-t-lg" />
          </CardContent>
          <CardHeader>
            <CardTitle>{{ product.name }}</CardTitle>
            <CardDescription> R$ {{ product.price.toFixed(2) }}</CardDescription>
          </CardHeader>
          <CardFooter class="flex justify-between">
            <Button variant="outline" @click="openProductDetails(product)">Ver detalhes</Button>
            <Button @click="addToCart(product)">Adicionar ao Carrinho</Button>
          </CardFooter>
        </Card>
      </div>
    </main>

    

    <!-- Modal de detalhes do produto -->
    <Dialog :open="!!selectedProduct" @update:open="closeProductDetails">
      <DialogContent v-if="selectedProduct">
        <DialogHeader>
          <DialogTitle>{{ selectedProduct.name }}</DialogTitle>
          <DialogDescription>{{ selectedProduct.category.name }}</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <img 
            :src="`http://localhost:3333/uploads/${selectedProduct.image}`" 
            :alt="selectedProduct.name" 
            class="w-full h-64 object-cover rounded-lg"
            @error="handleImageError"
          />
          <p class="text-2xl font-bold">R$ {{ selectedProduct.price?.toFixed(2) }}</p>
          <p>{{ selectedProduct.description }}</p>
        </div>
        <DialogFooter>
          <Button @click="addToCart(selectedProduct)">Adicionar ao Carrinho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Carrinho de compras -->
    <Sheet :open="isCartOpen" @update:open="isCartOpen = $event">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>
        <div v-if="cart.length === 0" class="text-center py-8">
          <p>Seu carrinho está vazio.</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in cart" :key="item.id" class="flex justify-between items-center">
            <span>{{ item.name }}</span>
            <div>
              <span class="mr-2">R$ {{ item.price.toFixed(2) }}</span>
              <Button variant="destructive" size="sm" @click="removeFromCart(item.id)">Remover</Button>
            </div>
          </div>
          <Separator />
          <div class="flex justify-between items-center font-bold">
            <span>Total:</span>
            <span>R$ {{ totalPrice.toFixed(2) }}</span>
          </div>
          <Button class="w-full">Finalizar Compra</Button>
        </div>
      </SheetContent>
    </Sheet>
  </div>
  <footer class="bg-muted  py-8 mt-8">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; 2024 Lucas Silva. Todos os direitos reservados.</p>
      </div>
    </footer>
  <Toaster />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ShoppingCart, Settings, LogOut } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'
import { Toaster, toast } from 'vue-sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Fecha o dropdown ao clicar fora
const closeDropdown = (event) => {
  if (event && event.target.closest('.DropdownMenuContent')) return
  isDropdownOpen.value = false
}

// Detecta cliques fora do dropdown
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

const goToAdmin = () => {
  router.push('/admin') // Rota para a área de administração
}

const logout = () => {
  const authToken = useCookie('auth_token')
  authToken.value = null // Remove o token
  toast.success('Você saiu com sucesso.')
  navigateTo('/login')
}

const products = ref([])
const categories = ref([])
const cart = ref([])
const isCartOpen = ref(false)
const selectedCategory = ref('')
const selectedProduct = ref(null)

// Computed para produtos filtrados com base na categoria

// Computed para produtos filtrados com base na categoria
const filteredProducts = computed(() => {
  if (!selectedCategory.value || selectedCategory.value === 'all') {
    return products.value // Retorna todos os produtos se a categoria for 'all'
  }
  return products.value.filter(product => product.category.id === selectedCategory.value)
})
// Calcula o preço total
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price, 0)
})

// Adiciona um produto ao carrinho
const addToCart = (product) => {
  cart.value.push(product)
}

// Remove um produto do carrinho
const removeFromCart = (id) => {
  cart.value = cart.value.filter(item => item.id !== id)
}

// Abre os detalhes de um produto
const openProductDetails = (product) => {
  selectedProduct.value = product
}

// Fecha os detalhes do produto
const closeProductDetails = () => {
  selectedProduct.value = null
}

// Fetch para carregar os produtos da API
const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3333/products')
    if (!response.ok) {
      throw new Error('Erro ao buscar os produtos.')
    }
    const data = await response.json()
    products.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

// Fetch para carregar as categorias da API
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:3333/categories')
    if (!response.ok) {
      throw new Error('Erro ao buscar as categorias.')
    }
    const data = await response.json()
    categories.value = ['all', ...data] // Adiciona a opção "Todas as categorias" ao início
  } catch (error) {
    toast.error(error.message)
  }
}

// Carrega os produtos e as categorias ao montar o componente
onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>