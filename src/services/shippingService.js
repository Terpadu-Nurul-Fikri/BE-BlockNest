const COURIERS = [
  {
    code: "jne",
    name: "JNE",
    services: [
      { code: "REG", name: "REG", cost: 18000, eta: "2-3 Hari" },
      { code: "YES", name: "YES", cost: 30000, eta: "1 Hari" },
    ],
  },
  {
    code: "jnt",
    name: "J&T",
    services: [
      { code: "REG", name: "Regular", cost: 17000, eta: "2 Hari" },
    ],
  },
  {
    code: "sicepat",
    name: "SiCepat",
    services: [
      { code: "BEST", name: "BEST", cost: 22000, eta: "1 Hari" },
    ],
  },
  {
    code: "anteraja",
    name: "AnterAja",
    services: [
      { code: "REG", name: "Reguler", cost: 19000, eta: "2 Hari" },
    ],
  },
];

export function getCouriers() {
  return COURIERS.map(({ code, name }) => ({ code, name }));
}

export function getServices(courierCode) {
  const courier = COURIERS.find((c) => c.code === courierCode);
  return courier ? courier.services : [];
}

export function getServiceCost(courierCode, serviceCode) {
  const courier = COURIERS.find((c) => c.code === courierCode);
  if (!courier) return null;
  const service = courier.services.find((s) => s.code === serviceCode);
  return service ? service.cost : null;
}
