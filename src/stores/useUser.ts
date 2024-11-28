import { create } from 'zustand';

interface UserDetails {
  id: number | null;
  name: string | null;
  lastname_pat: string | null;
  lastname_mat: string | null;
  email: string | null;
  curp: string | null;
  ocuparion: string | null;
  password: string | null;
  phone: string | null;
}

interface UserStore {
  userDetails: UserDetails | null;
  loading: boolean;
  error: string | null;
  fetchUserDetails: (email: string) => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  userDetails: null,
  loading: false,
  error: null,
  fetchUserDetails: async (email: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`/api/userByEmail/${email}?timestamp=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        set({ error: errorData.message });
      } else {
        const data = await response.json();
        set({ userDetails: data });
      }
    } catch (error) {
      set({ error: 'No se pudo conectar con la API externa.' });
    }

    set({ loading: false });
  },
}));

export default useUserStore;