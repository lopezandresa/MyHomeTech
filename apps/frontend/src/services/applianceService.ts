import api from './api';

export interface Appliance {
  id: number;
  type: string;
  brand: string;
  model: string;
  name: string;
  isActive: boolean;
}

export const applianceService = {
  // Obtener todos los electrodomésticos
  async getAll(): Promise<Appliance[]> {
    const response = await api.get('/appliances');
    return response.data;
  },

  // Obtener tipos únicos
  async getTypes(): Promise<string[]> {
    const response = await api.get('/appliances/types/list');
    return response.data;
  },

  // Obtener marcas por tipo
  async getBrandsByType(type: string): Promise<string[]> {
    const response = await api.get(`/appliances/brands/${encodeURIComponent(type)}`);
    return response.data;
  },

  // Obtener modelos por tipo y marca
  async getModelsByTypeAndBrand(type: string, brand: string): Promise<string[]> {
    const response = await api.get(
      `/appliances/models/${encodeURIComponent(type)}/${encodeURIComponent(brand)}`
    );
    return response.data;
  },

  // Buscar electrodoméstico específico
  async findByTypeAndBrandAndModel(type: string, brand: string, model: string): Promise<Appliance | null> {
    const response = await api.get(
      `/appliances/find/${encodeURIComponent(type)}/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`
    );
    return response.data;
  },

  // Buscar por ID
  async getById(id: number): Promise<Appliance> {
    const response = await api.get(`/appliances/${id}`);
    return response.data;
  },

  // Crear electrodoméstico (solo admin)
  async create(appliance: {
    type: string;
    brand: string;
    model: string;
    name?: string;
  }): Promise<Appliance> {
    const response = await api.post('/appliances/create', appliance);
    return response.data;
  }
};
