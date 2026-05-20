<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { badgeVariants } from '.'

type BadgeVariant = 'default' | 'secondary' | 'outline'

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariant
    class?: HTMLAttributes['class']
  }>(),
  {
    variant: 'default',
    class: '',
  },
)
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </div>
</template>
