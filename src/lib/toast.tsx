import { toast } from "@/components/ui/sonner"
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { ReactNode } from "react"

// Success toasts
export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: <Check className="h-4 w-4" /> as ReactNode,
  })
}

// Error toasts
export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 5000,
    icon: <AlertCircle className="h-4 w-4" /> as ReactNode,
  })
}

// Info toasts
export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: <Info className="h-4 w-4" /> as ReactNode,
  })
}

// Warning toasts
export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 4500,
    icon: <AlertTriangle className="h-4 w-4" /> as ReactNode,
  })
}

// CRUD Operation Toasts
export const crudToasts = {
  // Create operations
  create: {
    success: (entity: string) => showSuccessToast(
      `${entity} created successfully`,
      `The new ${entity.toLowerCase()} has been added to the system.`
    ),
    error: (entity: string) => showErrorToast(
      `Failed to create ${entity.toLowerCase()}`,
      "Please try again or contact support if the problem persists."
    ),
  },
  
  // Read/Load operations
  load: {
    error: (entity: string) => showErrorToast(
      `Failed to load ${entity.toLowerCase()}`,
      "Please check your connection and try again."
    ),
  },
  
  // Update operations
  update: {
    success: (entity: string) => showSuccessToast(
      `${entity} updated successfully`,
      `The ${entity.toLowerCase()} details have been saved.`
    ),
    error: (entity: string) => showErrorToast(
      `Failed to update ${entity.toLowerCase()}`,
      "Please try again or contact support if the problem persists."
    ),
  },
  
  // Delete operations
  delete: {
    success: (entity: string) => showSuccessToast(
      `${entity} deleted successfully`,
      `The ${entity.toLowerCase()} has been removed from the system.`
    ),
    error: (entity: string) => showErrorToast(
      `Failed to delete ${entity.toLowerCase()}`,
      "Please try again or contact support if the problem persists."
    ),
  },
  
  // Assignment operations
  assign: {
    success: (entity: string, target: string) => showSuccessToast(
      `${entity} assigned successfully`,
      `The ${entity.toLowerCase()} has been assigned to the ${target.toLowerCase()}.`
    ),
    error: (entity: string, target: string) => showErrorToast(
      `Failed to assign ${entity.toLowerCase()}`,
      `Unable to assign to ${target.toLowerCase()}. Please try again.`
    ),
  },
  
  // Unassignment operations
  unassign: {
    success: (entity: string, target: string) => showSuccessToast(
      `${entity} unassigned successfully`,
      `The ${entity.toLowerCase()} has been removed from the ${target.toLowerCase()}.`
    ),
    error: (entity: string, target: string) => showErrorToast(
      `Failed to unassign ${entity.toLowerCase()}`,
      `Unable to remove from ${target.toLowerCase()}. Please try again.`
    ),
  },
  
  // Generic validation error
  validation: {
    error: (message: string) => showWarningToast(
      "Validation Error",
      message
    ),
  },
  
  // Permission/Authorization errors
  permission: {
    error: (action: string) => showErrorToast(
      "Permission Denied",
      `You don't have permission to ${action.toLowerCase()}.`
    ),
  },
} 