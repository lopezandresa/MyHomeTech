import api from './api';
import type { ApplianceType, ApplianceBrand, ApplianceModel } from '../types/index';

export const applianceTypeService = {
  // Obtener todos los tipos de electrodomésticos
  async getAll(): Promise<ApplianceType[]> {
    const response = await api.get('/appliance-types');
    return response.data;
  },

  // Obtener tipo por ID
  async getById(id: number): Promise<ApplianceType> {
    const response = await api.get(`/appliance-types/${id}`);
    return response.data;
  }
};

export const applianceBrandService = {
  // Obtener todas las marcas
  async getAll(): Promise<ApplianceBrand[]> {
    const response = await api.get('/appliance-brands');
    return response.data;
  },

  // Obtener marcas por tipo
  async getByTypeId(typeId: number): Promise<ApplianceBrand[]> {
    const response = await api.get(`/appliance-brands/by-type/${typeId}`);
    return response.data;
  }
};

export const applianceModelService = {
  // Obtener todos los modelos
  async getAll(): Promise<ApplianceModel[]> {
    const response = await api.get('/appliance-models');
    return response.data;
  },

  // Obtener modelos por marca
  async getByBrandId(brandId: number): Promise<ApplianceModel[]> {
    const response = await api.get(`/appliance-models/by-brand/${brandId}`);
    return response.data;
  }
};

export default {
  types: applianceTypeService,
  brands: applianceBrandService,
  models: applianceModelService
};
