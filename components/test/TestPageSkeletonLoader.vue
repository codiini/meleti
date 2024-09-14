<template>
  <div class="flex flex-col lg:flex-row">
    <!-- Mobile Timer (Sticky on top for mobile) -->
    <div class="lg:hidden sticky top-0 z-10 bg-white p-4 mb-4">
      <USkeleton class="h-12 w-full rounded" />
    </div>

    <!-- Questions -->
    <div class="flex-1 space-y-4 p-4 lg:p-6 w-full">
      <UCard v-for="i in 5" :key="i" class="rounded-lg">
        <template #header>
          <USkeleton class="h-7 w-3/4" />
        </template>

        <div class="space-y-4">
          <div v-for="j in 4" :key="j" class="flex items-center space-x-2">
            <USkeleton class="h-5 w-5 rounded-full" />
            <USkeleton class="h-5 w-3/4" />
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-start gap-x-2">
            <USkeleton v-for="k in 3" :key="k" class="h-9 w-9 rounded" />
          </div>
        </template>
      </UCard>

      <div class="mt-8 flex items-center justify-center">
        <USkeleton class="h-12 w-40 rounded" />
      </div>
    </div>

    <!-- Desktop Timer (Sticky on side for desktop) -->
    <div class="hidden lg:block sticky top-20 mt-6 ml-4 w-40">
      <USkeleton class="h-12 w-full rounded" />
    </div>
  </div>
</template>
