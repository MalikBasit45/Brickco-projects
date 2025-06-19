export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string
          date_of_birth: string
          street: string
          city: string
          state: string
          postal_code: string
          country: string
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          phone: string
          date_of_birth: string
          street: string
          city: string
          state: string
          postal_code: string
          country: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string
          date_of_birth?: string
          street?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          created_at?: string
        }
      }
    }
  }
}