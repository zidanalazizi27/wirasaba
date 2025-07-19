// src/app/utils/sweetAlert.ts
import Swal, { SweetAlertIcon } from 'sweetalert2';

// Konfigurasi custom Sweet Alert dengan styling yang konsisten
export const customSwal = Swal.mixin({
  customClass: {
    confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg mx-2 transition-colors',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg mx-2 transition-colors',
    denyButton: 'bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg mx-2 transition-colors',
    popup: 'rounded-lg shadow-xl border-0',
    title: 'text-gray-800 font-semibold text-lg',
    htmlContainer: 'text-gray-600 text-sm',
    closeButton: 'text-gray-400 hover:text-gray-600',
    input: 'border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    validationMessage: 'bg-red-100 text-red-700 border border-red-300 rounded-lg'
  },
  buttonsStyling: false,
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster'
  }
});

// Interface untuk opsi alert
interface AlertOptions {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  timer?: number;
  showConfirmButton?: boolean;
  [key: string]: unknown;
}

// Utility functions untuk berbagai jenis alert
export const SweetAlertUtils = {
  // Alert sukses
  success: (title: string = 'Berhasil!', text?: string, options?: AlertOptions) => {
    return customSwal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
      ...options
    });
  },

  // Alert error
  error: (title: string = 'Error!', text?: string, options?: AlertOptions) => {
    return customSwal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      ...options
    });
  },

  // Alert warning
  warning: (title: string = 'Peringatan!', text?: string, options?: AlertOptions) => {
    return customSwal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      ...options
    });
  },

  // Alert info
  info: (title: string = 'Informasi', text?: string, options?: AlertOptions) => {
    return customSwal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      ...options
    });
  },

  // Konfirmasi dengan Yes/No
  confirm: async (
    title: string = 'Konfirmasi',
    text?: string,
    confirmText: string = 'Ya',
    cancelText: string = 'Tidak',
    options?: AlertOptions
  ): Promise<boolean> => {
    const result = await customSwal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      ...options
    });
    return result.isConfirmed;
  },

  // Konfirmasi hapus
  confirmDelete: async (
    title: string = 'Hapus Data',
    text: string = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
    confirmText: string = 'Ya, Hapus',
    cancelText: string = 'Batal'
  ): Promise<boolean> => {
    const result = await customSwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      confirmButtonColor: '#ef4444', // Red color for delete
      focusCancel: true
    });
    return result.isConfirmed;
  },

  // Konfirmasi save
  confirmSave: async (
    title: string = 'Simpan Data',
    text: string = 'Apakah Anda yakin ingin menyimpan data ini?',
    confirmText: string = 'Ya, Simpan',
    cancelText: string = 'Batal'
  ): Promise<boolean> => {
    const result = await customSwal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
    return result.isConfirmed;
  },

  // Konfirmasi cancel dengan warning untuk unsaved changes
  confirmCancel: async (
    title: string = 'Batalkan Perubahan',
    text: string = 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?',
    confirmText: string = 'Ya, Batalkan',
    cancelText: string = 'Tetap Edit'
  ): Promise<boolean> => {
    const result = await customSwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      confirmButtonColor: '#ef4444'
    });
    return result.isConfirmed;
  },

  // Alert loading
  loading: (title: string = 'Memproses...', text?: string) => {
    return customSwal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        customSwal.showLoading();
      }
    });
  },

  // Close loading
  closeLoading: () => {
    customSwal.close();
  },

  // Alert dengan input
  input: async (
    title: string,
    inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text',
    placeholder?: string,
    defaultValue?: string,
    validator?: (value: string) => string | null
  ): Promise<string | null> => {
    const result = await customSwal.fire({
      title,
      input: inputType,
      inputPlaceholder: placeholder,
      inputValue: defaultValue,
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Batal',
      inputValidator: validator ? (value) => {
        const error = validator(value);
        return error || undefined;
      } : undefined
    });
    
    return result.isConfirmed ? result.value : null;
  },

  // Alert untuk validasi form
  validationError: (errors: string[], title: string = 'Peringatan Validasi') => {
    const errorList = errors.map(error => `• ${error}`).join('\n');
    return customSwal.fire({
      title,
      text: `Mohon lengkapi field berikut:\n\n${errorList}`,
      icon: 'warning',
      confirmButtonText: 'OK',
      customClass: {
        htmlContainer: 'text-left whitespace-pre-line'
      }
    });
  },

  // Toast notification (non-blocking)
  toast: (
    title: string,
    icon: SweetAlertIcon = 'success',
    position: 'top' | 'top-end' | 'top-start' | 'bottom' | 'bottom-end' | 'bottom-start' = 'top-end',
    timer: number = 3000
  ) => {
    return customSwal.fire({
      toast: true,
      position,
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }
};

// Export default untuk backward compatibility
export default SweetAlertUtils;