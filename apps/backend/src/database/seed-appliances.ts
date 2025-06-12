import { DataSource } from 'typeorm';
import { Appliance } from '../appliance/appliance.entity';

export const seedAppliances = async (dataSource: DataSource) => {
  const applianceRepo = dataSource.getRepository(Appliance);

  // Electrodomésticos de ejemplo
  const appliances = [
    // Refrigeradores
    { type: 'Refrigerador', brand: 'Samsung', model: 'RT38K5010S8' },
    { type: 'Refrigerador', brand: 'Samsung', model: 'RF23M8090SR' },
    { type: 'Refrigerador', brand: 'LG', model: 'GS65SPP1' },
    { type: 'Refrigerador', brand: 'LG', model: 'GR-X24FTQKL' },
    { type: 'Refrigerador', brand: 'Whirlpool', model: 'WRS571CIHZ' },
    { type: 'Refrigerador', brand: 'Whirlpool', model: 'WRT518SZFM' },

    // Lavadoras
    { type: 'Lavadora', brand: 'Samsung', model: 'WA16T6260BY' },
    { type: 'Lavadora', brand: 'Samsung', model: 'WF15T4000AV' },
    { type: 'Lavadora', brand: 'LG', model: 'WM3900HWA' },
    { type: 'Lavadora', brand: 'LG', model: 'WT7305CW' },
    { type: 'Lavadora', brand: 'Whirlpool', model: 'WTW5000DW' },
    { type: 'Lavadora', brand: 'Whirlpool', model: 'WFW9620HC' },

    // Microondas
    { type: 'Microondas', brand: 'Samsung', model: 'MG14H3020CM' },
    { type: 'Microondas', brand: 'Samsung', model: 'MS14K6000AS' },
    { type: 'Microondas', brand: 'LG', model: 'MS2595CIS' },
    { type: 'Microondas', brand: 'LG', model: 'LMC2075ST' },
    { type: 'Microondas', brand: 'Panasonic', model: 'NN-SN966S' },
    { type: 'Microondas', brand: 'Panasonic', model: 'NN-SN686S' },

    // Lavavajillas
    { type: 'Lavavajillas', brand: 'Samsung', model: 'DW80R9950UT' },
    { type: 'Lavavajillas', brand: 'Samsung', model: 'DW80R5060US' },
    { type: 'Lavavajillas', brand: 'LG', model: 'LDP6797ST' },
    { type: 'Lavavajillas', brand: 'LG', model: 'LDF5545ST' },
    { type: 'Lavavajillas', brand: 'Whirlpool', model: 'WDT750SAKZ' },
    { type: 'Lavavajillas', brand: 'Whirlpool', model: 'WDF520PADM' },

    // Secadoras
    { type: 'Secadora', brand: 'Samsung', model: 'DV16T8520BV' },
    { type: 'Secadora', brand: 'Samsung', model: 'DV15T7300GV' },
    { type: 'Secadora', brand: 'LG', model: 'DLEX9000V' },
    { type: 'Secadora', brand: 'LG', model: 'DLE7300WE' },
    { type: 'Secadora', brand: 'Whirlpool', model: 'WED8620HC' },
    { type: 'Secadora', brand: 'Whirlpool', model: 'WED4815EW' },

    // Estufas
    { type: 'Estufa', brand: 'Samsung', model: 'NX60T8711SS' },
    { type: 'Estufa', brand: 'Samsung', model: 'NE63T8111SS' },
    { type: 'Estufa', brand: 'LG', model: 'LREL6325F' },
    { type: 'Estufa', brand: 'LG', model: 'LRG4115ST' },
    { type: 'Estufa', brand: 'Whirlpool', model: 'WFE515S0ES' },
    { type: 'Estufa', brand: 'Whirlpool', model: 'WEG515S0FS' },
  ];

  for (const applianceData of appliances) {
    const existingAppliance = await applianceRepo.findOne({
      where: {
        type: applianceData.type,
        brand: applianceData.brand,
        model: applianceData.model,
      },
    });

    if (!existingAppliance) {
      const appliance = applianceRepo.create({
        ...applianceData,
        name: `${applianceData.type} ${applianceData.brand} ${applianceData.model}`,
        isActive: true,
      });
      await applianceRepo.save(appliance);
      console.log(`Created appliance: ${appliance.name}`);
    }
  }

  console.log('Appliance seeding completed!');
};
