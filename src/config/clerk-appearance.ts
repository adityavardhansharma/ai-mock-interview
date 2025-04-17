export const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb', // blue-600
    colorTextOnPrimaryBackground: 'white',
    colorBackground: '#ffffff',
    colorText: '#1e3a8a', // blue-900
    colorInputBackground: '#ffffff', // white background for inputs 
    colorInputText: '#1e3a8a', // blue-900
    colorTextSecondary: '#3b82f6', // blue-500
    colorSuccess: '#10b981', // green-500
    colorError: '#ef4444', // red-500
    colorWarning: '#f59e0b', // yellow-500
    colorAlphaShade: '#dbeafe', // blue-100
    borderRadius: '0.375rem', // rounded-md
  },
  elements: {
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white py-3',
    card: 'shadow-md rounded-lg border border-blue-100',
    header: 'text-blue-900 font-bold',
    headerTitle: 'text-2xl text-blue-900',
    headerSubtitle: 'text-blue-600 text-lg',
    formFieldLabel: 'text-blue-800 font-medium',
    formFieldInput: 'bg-white border border-blue-200 focus:ring-blue-500 focus:border-blue-500 rounded-md px-3 py-2',
    identityPreview: 'bg-blue-50 border border-blue-100',
    socialButtonsIconButton: 'border border-blue-100 hover:bg-blue-50',
    socialButtonsBlockButton: 'border border-blue-100 hover:bg-blue-50 text-blue-800',
    footerActionLink: 'text-blue-600 hover:text-blue-800',
    alert: 'bg-red-50 text-red-700 border border-red-100',
    alertText: 'text-red-700',
    formFieldAction: 'text-blue-600 hover:text-blue-800',
    dividerLine: 'bg-blue-100',
    dividerText: 'text-blue-600',
    formFieldWarningText: 'text-yellow-600',
    badge: 'bg-blue-50 text-blue-700',
    avatarBox: 'border-2 border-blue-100',
    activeDevice: 'bg-blue-50 border border-blue-100',
    pageBackground: 'bg-gradient-to-b from-blue-50 to-white',
  },
  layout: {
    socialButtonsVariant: 'iconButton',
    socialButtonsPlacement: 'bottom',
    showOptionalFields: false,
    shimmer: false,
  },
}; 