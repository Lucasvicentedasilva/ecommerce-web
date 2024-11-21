<template>
  <div class="container mx-auto py-10">
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Gerenciamento de Produtos</CardTitle>
        <CardDescription>Adicione ou edite produtos da loja</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="isEditing ? saveChanges() : handleSubmit()">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="name">Nome do Produto</Label>
              <Input id="name" v-model="product.name" required />
            </div>
            <div class="grid gap-2">
    <label for="price">Preço</label>
    <Input
  id="price"
  v-model="product.price"
  type="text"
  @blur="maskPrice"
  required
/>
  </div>
            <div class="grid gap-2">
              <Label for="category">Categoria</Label>
              <Select v-model="product.categoryId">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div class="mt-2">
                <Button type="button" variant="link" @click="showCategoryModal = true">
                  Criar nova categoria
                </Button>
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="description">Descrição</Label>
              <Textarea id="description" v-model="product.description" required />
            </div>
            <div class="grid gap-2">
              <Label for="image">Selecione a Imagem</Label>
              <Input  id="image" type="file"  accept="image/*" @change="onImageChange"  required/>
            </div>
          </div>
          <div class="flex justify-between mt-6">
            <Button type="submit">{{ isEditing ? 'Salvar Alterações' : 'Adicionar Produto' }}</Button>
            <Button type="button" variant="outline" @click="resetForm">Limpar</Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Modal para criar categoria -->
    <Dialog :open="showCategoryModal" @update:open="showCategoryModal = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="categoryName">Nome da Categoria</Label>
            <Input id="categoryName" v-model="newCategoryName" placeholder="Nome da Categoria" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" @click="createCategory" :disabled="!newCategoryName">Criar</Button>
          <Button type="button" variant="outline" @click="showCategoryModal = false">Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card>
      <CardHeader>
        <CardTitle>Lista de Produtos</CardTitle>
        <CardDescription>Gerencie os produtos existentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-4">Carregando produtos...</div>
        <div v-else-if="products.length === 0" class="text-center py-4">
          Nenhum produto cadastrado
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="prod in products" :key="prod.id">
              <TableCell>
                <div class="flex items-center">
                  <!-- <img 
                    :src="prod.image" 
                    :alt="prod.name" 
                    class="h-8 w-8 rounded-full mr-2"
                    @error="handleImageError"
                  /> -->
                  <span>{{ prod.name }}</span>
                </div>
              </TableCell>
              <TableCell>R$ {{ (prod.price.toFixed(2)) }}</TableCell>
              <TableCell>{{ prod.category?.name }}</TableCell>
              <TableCell>
                <Button variant="ghost" @click="editProduct(prod)" class="mr-2">
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  @click="confirmDelete(prod)"
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { reactive } from 'vue';



const API_URL = 'http://localhost:3333'


const maskPrice = () => {
  console.log("Masking price", product.value.price);
  if (product.value.price) {
    let value = product.value.price.replace(/[^\d,]/g, '');  // Remove tudo que não for número ou vírgula
    value = value.replace(',', '.');  // Substitui a vírgula por ponto para parsing correto

    const number = parseFloat(value);
    if (!isNaN(number)) {
      // Formata no padrão brasileiro
      product.value.price = number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    } else {
      product.value.price = ''; // Caso não seja um valor válido, limpa o campo
    }
  }
};


const product = ref({
  id: null,
  name: '',
  price: '',
  categoryId: null,
  description: '',
  image: null
})

const products = ref([])
const categories = ref([])
const isEditing = ref(false)
const productIdBeingEdited = ref(null)
const showCategoryModal = ref(false)
const newCategoryName = ref('')
const loading = ref(false)



 const formatPrice = (price) => {
  return Number(price).toFixed(2)
 }

const onImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    product.value.image = file
  }
}

// const handleImageError = (event) => {
//   event.target.src = '/placeholder-image.png' // Defina uma imagem padrão
// }

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3333/products`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    products.value = data
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    toast.error('Erro ao carregar produtos: ' + error.message)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await fetch(`http://localhost:3333/categories`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    categories.value = await response.json()
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    toast.error('Erro ao carregar categorias: ' + error.message)
  }
}

const handleSubmit = async () => {
  try {
    const formData = new FormData()

    formData.append('name', product.value.name)
    formData.append('price', product.value.price)
    formData.append('description', product.value.description)
    formData.append('categoryId', product.value.categoryId)

    if (product.value.image) {
      formData.append('image', product.value.image)
    }

    const response = await fetch(`http://localhost:3333/products`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao adicionar produto')
    }

    fetchProducts();
    resetForm()
    toast.success('Produto adicionado com sucesso')
  } catch (error) {
    console.error('Erro ao adicionar produto:', error)
    toast.error('Erro ao adicionar produto: ' + error.message)
  }
}

const resetForm = () => {
  product.value = {
    id: null,
    name: '',
    price: '',
    categoryId: null,
    description: '',
    image: null
  }
  isEditing.value = false
  productIdBeingEdited.value = null
}

const editProduct = (productToEdit) => {
  productIdBeingEdited.value = productToEdit.id
  product.value = {
    id: productToEdit.id,
    name: productToEdit.name,
    price: productToEdit.price,
    categoryId: productToEdit.category?.id,
    description: productToEdit.description,
    image: productToEdit.image
  }
  isEditing.value = true
}

const saveChanges = async () => {
  try {
    const formData = new FormData()

    formData.append('name', product.value.name)
    formData.append('price', product.value.price)
    formData.append('description', product.value.description)
    formData.append('categoryId', product.value.categoryId)
    console.log(product.value.image)
    if (product.value.image) {
      formData.append('image', product.value.image)
    }

    const productId = product.value.id
    const response = await fetch(`http://localhost:3333/products/${productId}`, {
      method: 'PUT',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao salvar alterações')
    }

    const updatedProduct = await response.json()
    const index = products.value.findIndex(p => p.id === productIdBeingEdited.value)
    if (index !== -1) {
      products.value[index] = updatedProduct
    }

    resetForm()
    toast.success('Alterações salvas com sucesso')
  } catch (error) {
    console.error('Erro ao salvar alterações:', error)
    toast.error('Erro ao salvar alterações: ' + error.message)
  }
}

const confirmDelete = async (product) => {
  if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
    await deleteProduct(product.id)
  }
}

const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`http://localhost:3333/products/${productId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao excluir produto')
    }

    products.value = products.value.filter(p => p.id !== productId)
    toast.success('Produto excluído com sucesso')
  } catch (error) {
    console.error('Erro ao excluir produto:', error)
    toast.error('Erro ao excluir produto: ' + error.message)
  }
}

const createCategory = async () => {
  try {
    const response = await fetch(`http://localhost:3333/categories/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.value })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao criar categoria')
    }

    const newCategory = await response.json()
    categories.value.push(newCategory)
    showCategoryModal.value = false
    newCategoryName.value = ''
    toast.success('Categoria criada com sucesso')
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    toast.error('Erro ao criar categoria: ' + error.message)
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>