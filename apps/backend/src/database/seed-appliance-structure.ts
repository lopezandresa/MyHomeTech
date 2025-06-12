import { DataSource } from 'typeorm';
import { ApplianceType } from '../appliance-type/appliance-type.entity';
import { ApplianceBrand } from '../appliance-brand/appliance-brand.entity';
import { ApplianceModel } from '../appliance-model/appliance-model.entity';

export const seedApplianceStructure = async (dataSource: DataSource) => {
  const typeRepo = dataSource.getRepository(ApplianceType);
  const brandRepo = dataSource.getRepository(ApplianceBrand);
  const modelRepo = dataSource.getRepository(ApplianceModel);

  console.log('Seeding appliance structure...');

  // Seed types
  const types = [
    { name: 'Refrigerador', description: 'Electrodomésticos de refrigeración' },
    { name: 'Lavadora', description: 'Máquinas lavadoras de ropa' },
    { name: 'Microondas', description: 'Hornos microondas' },
    { name: 'Estufa', description: 'Estufas y cocinas' },
    { name: 'Secadora', description: 'Secadoras de ropa' },
    { name: 'Lavavajillas', description: 'Lavavajillas automáticos' },
    { name: 'Aire Acondicionado', description: 'Sistemas de climatización' },
    { name: 'Calentador', description: 'Calentadores de agua' }
  ];
  const createdTypes: ApplianceType[] = [];
  for (const typeData of types) {
    let type = await typeRepo.findOne({ where: { name: typeData.name } });
    if (!type) {
      type = typeRepo.create(typeData);
      type = await typeRepo.save(type);
      console.log(`Created type: ${type.name}`);
    }
    createdTypes.push(type);
  }

  // Seed brands for each type
  const brandData = [
    { typeName: 'Refrigerador', brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Frigidaire'] },
    { typeName: 'Lavadora', brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Maytag'] },
    { typeName: 'Microondas', brands: ['Samsung', 'LG', 'Panasonic', 'Sharp', 'GE'] },
    { typeName: 'Estufa', brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Frigidaire'] },
    { typeName: 'Secadora', brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Maytag'] },
    { typeName: 'Lavavajillas', brands: ['Samsung', 'LG', 'Whirlpool', 'GE', 'Bosch'] },
    { typeName: 'Aire Acondicionado', brands: ['Samsung', 'LG', 'Carrier', 'Trane', 'Daikin'] },
    { typeName: 'Calentador', brands: ['Rheem', 'A.O. Smith', 'Bradford White', 'State', 'GE'] }
  ];
  const createdBrands: ApplianceBrand[] = [];
  for (const typeGroup of brandData) {
    const type = createdTypes.find(t => t.name === typeGroup.typeName);
    if (type) {
      for (const brandName of typeGroup.brands) {
        let brand = await brandRepo.findOne({ 
          where: { name: brandName, typeId: type.id } 
        });
        if (!brand) {
          brand = brandRepo.create({
            name: brandName,
            typeId: type.id
          });
          brand = await brandRepo.save(brand);
          console.log(`Created brand: ${brand.name} for ${type.name}`);
        }
        createdBrands.push(brand);
      }
    }
  }

  // Seed some sample models
  const modelData = [
    { brandName: 'Samsung', typeName: 'Refrigerador', models: ['RF23R6201SR', 'RF28R7551SR', 'RT18M6215SG'] },
    { brandName: 'LG', typeName: 'Refrigerador', models: ['LRFVS3006S', 'LMXS30796S', 'LTCS24223S'] },
    { brandName: 'Samsung', typeName: 'Lavadora', models: ['WF45K6200AW', 'WF50K7500AV', 'WF42H5000AW'] },
    { brandName: 'LG', typeName: 'Lavadora', models: ['WM3900HWA', 'WM4000HWA', 'WT7300CW'] },
    { brandName: 'Samsung', typeName: 'Microondas', models: ['MS14K6000AS', 'ME21M706BAS', 'MS19M8000AS'] },
    { brandName: 'Samsung', typeName: 'Estufa', models: ['NX60T8711SS', 'NE63T8111SS'] },
    { brandName: 'LG', typeName: 'Estufa', models: ['LREL6325F', 'LRG4115ST'] }
  ];

  for (const modelGroup of modelData) {
    const type = createdTypes.find(t => t.name === modelGroup.typeName);
    const brand = createdBrands.find(b => 
      b.name === modelGroup.brandName && b.typeId === type?.id
    );
    
    if (brand) {
      for (const modelName of modelGroup.models) {
        let model = await modelRepo.findOne({ 
          where: { name: modelName, brandId: brand.id } 
        });
        if (!model) {
          model = modelRepo.create({
            name: modelName,
            brandId: brand.id
          });
          model = await modelRepo.save(model);
          console.log(`Created model: ${model.name} for ${brand.name}`);
        }
      }
    }
  }

  console.log('Appliance structure seeding completed!');
};
