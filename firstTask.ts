import { reactive, computed, Ref, ref } from 'vue'

// Типы для правил валидации
type ValidationRule<T> = (value: T) => boolean | string | Promise<boolean | string>
type FieldRules<T> = Record<string, ValidationRule<T>[]>

// Состояние поля
interface FieldState {
  isValid: boolean
  errorMessage: string
}

// Состояние формы
interface FormState {
  fields: Record<string, FieldState>
  isValid: boolean
}

export function useFormValidation<T extends Record<string, any>>(
  formData: Ref<T>,
  rules: FieldRules<T[keyof T]>
) {
  // Реактивное состояние полей
  const fieldsState = reactive<Record<string, FieldState>>({});

  // Инициализация состояния для каждого поля
  const initializeFieldState = () => {
    Object.keys(rules).forEach((field) => {
      fieldsState[field] = {
        isValid: true,
        errorMessage: ''
      };
    });
  };

  initializeFieldState();

  // Валидация одного поля
  const validateField = async (field: string, value: T[keyof T]) => {
    const fieldRules = rules[field] || [];
    
    for (const rule of fieldRules) {
      const result = await rule(value);
      
      if (result !== true) {
        fieldsState[field].isValid = false;
        fieldsState[field].errorMessage = typeof result === 'string' ? result : 'Invalid value';
        return;
      }
    }
    
    fieldsState[field].isValid = true;
    fieldsState[field].errorMessage = '';
  };

  // Валидация всей формы
  const validateForm = async () => {
    const validations = Object.keys(rules).map(field => 
      validateField(field, formData.value[field])
    );
    
    await Promise.all(validations);
  };

  // Статус валидности формы
  const isFormValid = computed(() => {
    return Object.values(fieldsState).every(field => field.isValid);
  });

  return {
    fieldsState,
    isFormValid,
    validateForm,
    validateField
  };
}
