import { FieldContextKey, useFieldError, useIsFieldDirty, useIsFieldTouched, useIsFieldValid } from 'vee-validate'
import { computed, inject } from 'vue'
import { FORM_ITEM_INJECTION_KEY } from './injectionKeys'

export function useFormField() {
  const fieldContext = inject(FieldContextKey)
  const fieldItemContext = inject(FORM_ITEM_INJECTION_KEY)

  if (!fieldContext)
    throw new Error('useFormField should be used within <FormField>')

  const { name } = fieldContext
  const id = fieldItemContext

  const valid = useIsFieldValid(name)
  const isDirty = useIsFieldDirty(name)
  const isTouched = useIsFieldTouched(name)
  const error = useFieldError(name)

  // Only surface errors after interaction / step validation marks the field touched.
  const visibleError = computed(() =>
    isTouched.value || isDirty.value ? error.value : undefined
  )

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    valid,
    isDirty,
    isTouched,
    error: visibleError,
  }
}
