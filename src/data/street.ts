export interface StreetSupplyDef {
  id: string;
  vendor: string;
  title: string;
  costAp: number;
  costM: number;
  gainS: number;
  gainC: number;
  detail: string;
}

export const STREET_SUPPLIES: StreetSupplyDef[] = [
  {
    id: 'supply_small',
    vendor: '镇集杂货',
    title: '进一小捆普通纸料',
    costAp: 1,
    costM: 10,
    gainS: 4,
    gainC: 0,
    detail: '工时 −1 · 现金 −10 · 纸料 +4'
  },
  {
    id: 'supply_large',
    vendor: '镇集杂货',
    title: '进一大捆普通纸料',
    costAp: 1,
    costM: 22,
    gainS: 10,
    gainC: 0,
    detail: '工时 −1 · 现金 −22 · 纸料 +10'
  },
  {
    id: 'supply_lin_clean',
    vendor: '林医生诊所',
    title: '林医生的洁净料包',
    costAp: 1,
    costM: 18,
    gainS: 3,
    gainC: 1,
    detail: '工时 −1 · 现金 −18 · 纸料 +3 · 洁净 +1'
  }
];
