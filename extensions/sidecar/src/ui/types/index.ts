export interface ComponentProps {
  title?: string
  message?: string
  count?: number
  disabled?: boolean
}

export interface CustomEventDetail {
  value: any
  timestamp: number
}

export type CustomEventType = 'button-click' | 'input-change' | 'form-submit'