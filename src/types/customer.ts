export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUpdateData {
  name?: string;
  email?: string;
  phone?: string | null;
  isActive?: boolean;
} 