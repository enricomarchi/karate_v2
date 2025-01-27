<template>
  <div class="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow-lg rounded-lg p-6">
        <h1 class="text-2xl font-bold mb-6">Nuova Configurazione</h1>
        <ConfigurationForm
          :initial-data="{ nome: '', prove: [] }"
          submit-label="Salva"
          @submit="salvaConfigurazione"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfigurationForm from '~/components/configurazioni/ConfigurationForm.vue'

const router = useRouter()
const loading = ref(false)

const salvaConfigurazione = async (configData) => {
  loading.value = true
  try {
    const response = await fetch("/api/configurazioni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configData),
    })

    if (!response.ok) throw new Error("Errore nel salvataggio")
    router.push('/configurazioni')
  } catch (error) {
    console.error("Errore:", error)
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>
