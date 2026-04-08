import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: (message: string) => sonnerToast(message),
  };
}

export { toast } from 'sonner';
