import React from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { dashboardStyles } from '../../utils/dashboardStyles'

interface FormFieldProps {
  label: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  error?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  icon: IconComponent,
  children,
  error
}) => {
  return (
    <div className={dashboardStyles.form.field}>
      <label className={dashboardStyles.form.label}>
        {IconComponent && <IconComponent className="h-4 w-4" />}
        <span>{label}</span>
        {required && <span className={dashboardStyles.form.required}>*</span>}
      </label>
      {children}
      {error && (
        <p className={`${dashboardStyles.text.error} ${dashboardStyles.text.xs}`}>
          {error}
        </p>
      )}
    </div>
  )
}

interface FormActionsProps {
  isEditing: boolean
  isLoading: boolean
  onSave: () => void
  onCancel: () => void
  saveText?: string
  cancelText?: string
  disabled?: boolean
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  isLoading,
  onSave,
  onCancel,
  saveText = 'Guardar Cambios',
  cancelText = 'Cancelar',
  disabled = false
}) => {
  if (!isEditing) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex space-x-4 justify-end mt-8 pt-6 border-t border-gray-200"
    >
      <button
        onClick={onCancel}
        disabled={isLoading}
        className={dashboardStyles.button.secondary}
      >
        <XMarkIcon className="h-4 w-4" />
        <span>{cancelText}</span>
      </button>
      <button
        onClick={onSave}
        disabled={isLoading || disabled}
        className={dashboardStyles.button.primary}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <CheckIcon className="h-4 w-4" />
        )}
        <span>{saveText}</span>
      </button>
    </motion.div>
  )
}

interface FormGridProps {
  children: React.ReactNode
  columns?: 1 | 2
  className?: string
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className = ''
}) => {
  const gridClass = columns === 1 
    ? 'grid grid-cols-1 gap-6'
    : dashboardStyles.form.grid

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input: React.FC<InputProps> = ({ 
  className = '', 
  error,
  ...props 
}) => {
  const inputClass = error 
    ? `${dashboardStyles.form.input} border-red-300 focus:border-red-500 focus:ring-red-500`
    : dashboardStyles.form.input

  return (
    <input
      className={`${inputClass} ${className}`}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({ 
  className = '', 
  error,
  ...props 
}) => {
  const textareaClass = error 
    ? `${dashboardStyles.form.textarea} border-red-300 focus:border-red-500 focus:ring-red-500`
    : dashboardStyles.form.textarea

  return (
    <textarea
      className={`${textareaClass} ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
}

export const Select: React.FC<SelectProps> = ({ 
  className = '', 
  error,
  options,
  ...props 
}) => {
  const selectClass = error 
    ? `${dashboardStyles.form.select} border-red-300 focus:border-red-500 focus:ring-red-500`
    : dashboardStyles.form.select

  return (
    <select
      className={`${selectClass} ${className}`}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
