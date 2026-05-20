<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    class?: HTMLAttributes['class']
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'default',
    size: 'default',
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="props.type"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </button>
</template>
